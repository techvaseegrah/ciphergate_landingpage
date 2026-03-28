
// backend/utils/productivityCalculator.js

const calculateWorkerProductivity = (productivityParameters) => {
  const {
    attendanceData,
    fromDate,
    toDate,
    options = {},
    worker,
  } = productivityParameters;

  const {
    considerOvertime = false,
    deductSalary = true,
    deductLateMinutes = true,
    permissionTimeMinutes = 15,
    salaryDeductionPerBreak = 10,
    batches = [],
    intervals = [],
    fiteredBatch = 'Full Time',
    isLunchConsider = false,
    holidays = []
  } = options;

  let standardWorkingMinutes;

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':').map(Number);
    const hours = parts[0] || 0;
    const minutes = parts[1] || 0;
    const seconds = parts[2] || 0;
    return hours * 60 + minutes + seconds / 60;
  };

  const minutesToTime = (totalMinutes) => {
    const totalSeconds = Math.round(totalMinutes * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const parseAttendanceTime = (timeStr) => {
    if (!timeStr) return 0;
    const [time, period] = timeStr.split(' ');
    const [hours, minutes, seconds = 0] = time.split(':').map(Number);

    let totalSeconds = seconds + (minutes * 60) + (hours * 3600);

    if (period === 'AM') {
      if (hours === 12) totalSeconds -= 12 * 3600;
    } else if (period === 'PM') {
      if (hours !== 12) totalSeconds += 12 * 3600;
    }

    return totalSeconds / 60;
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    return `${day.toString().padStart(2, '0')} ${month}`;
  };

  const isSunday = (date) => {
    const day = new Date(date);
    return day.getDay() === 0;
  };

  const isHoliday = (date) => {
    if (!holidays || holidays.length === 0) return null;
    const dateStr = new Date(date).toISOString().split('T')[0];
    const holiday = holidays.find(h => {
      const holidayDate = new Date(h.date).toISOString().split('T')[0];
      return holidayDate === dateStr;
    });
    return holiday || null;
  };

  // NEW FUNCTION: Check if a holiday applies to a specific worker
  const isHolidayForWorker = (date, workerId) => {
    if (!holidays || holidays.length === 0) return null;
    const dateStr = new Date(date).toISOString().split('T')[0];
    const holiday = holidays.find(h => {
      const holidayDate = new Date(h.date).toISOString().split('T')[0];
      // Check if dates match
      if (holidayDate !== dateStr) return false;

      // If it's a company-wide holiday (appliesTo: 'all'), it applies to all workers
      if (h.appliesTo === 'all') return true;

      // If it's a specific holiday, check if the worker is in the workers array
      if (h.appliesTo === 'specific' && h.workers) {
        // Handle both string IDs and object IDs
        return h.workers.some(w => {
          // Convert both values to strings for comparison
          const workerIdStr = workerId.toString ? workerId.toString() : String(workerId);
          if (typeof w === 'string') {
            return w === workerIdStr;
          } else if (w && typeof w === 'object') {
            const wIdStr = (w._id || w).toString ? (w._id || w).toString() : String(w._id || w);
            return wIdStr === workerIdStr;
          }
          return false;
        });
      }

      return false;
    });
    return holiday || null;
  };

  const generateDateRange = (fromDate, toDate) => {
    const dates = [];
    const currentDate = new Date(fromDate);
    const endDate = new Date(toDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const countSundaysInRange = (fromDate, toDate) => {
    const dates = generateDateRange(fromDate, toDate);
    return dates.filter(date => isSunday(date)).length;
  };

  // Function to pair IN and OUT punches correctly
  const pairPunches = (punches, workEnd, workEndTime, workStart) => {
    const pairs = [];
    let i = 0;

    while (i < punches.length) {
      // If current punch is OUT, it's an orphaned OUT punch
      if (!punches[i].record.presence) {
        // For an orphaned OUT punch, create a pair representing a full day absent
        // We'll treat this as if they should have worked the full day but didn't punch IN
        const pseudoInPunch = {
          time: workStart,
          originalTime: `MISSING PUNCH`,
          record: {
            ...punches[i].record,
            presence: true,
            isAutoGenerated: true,
            isOrphanedOut: true
          }
        };

        // Pair the pseudo IN with the actual OUT punch
        pairs.push({
          in: pseudoInPunch,
          out: punches[i],
          isAutoOut: false,
          isOrphanedOut: true
        });

        i++; // Move to next punch
        continue;
      }

      // Current punch is IN
      const inPunch = punches[i];
      let outPunch = null;
      let isAutoOut = false;

      // Look for the next immediate OUT punch (should be the very next punch)
      if (i + 1 < punches.length && !punches[i + 1].record.presence) {
        // The very next punch is an OUT punch, pair them
        outPunch = punches[i + 1];
        i += 2; // Move past both IN and OUT punches
      } else {
        // No immediate OUT punch found, create an auto OUT at end of shift
        const autoOutTime = workEnd;
        outPunch = {
          time: autoOutTime,
          originalTime: `AUTO-OUT (${workEndTime})`,
          record: {
            ...inPunch.record,
            presence: false,
            isAutoGenerated: true
          }
        };
        isAutoOut = true;
        i++; // Move to next punch
      }

      pairs.push({
        in: inPunch,
        out: outPunch,
        isAutoOut,
        isOrphanedOut: false
      });
    }

    return pairs;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // TIME CONSTANTS AND HELPERS
  // ─────────────────────────────────────────────────────────────────────────────
  const isSingleDay = new Date(fromDate).toDateString() === new Date(toDate).toDateString();
  const selectedBatch = batches.find(batch => batch.batchName === (worker?.batch || fiteredBatch));
  const workStartTime = selectedBatch ? selectedBatch.from : '09:00';
  const workEndTime = selectedBatch ? selectedBatch.to : '19:00';
  const workStart = timeToMinutes(workStartTime);
  const workEnd = timeToMinutes(workEndTime);

  // Use batch-specific lunch settings
  const lunchFrom = selectedBatch ? selectedBatch.lunchFrom : '12:00';
  const lunchTo = selectedBatch ? selectedBatch.lunchTo : '13:00';
  const lunchStart = timeToMinutes(lunchFrom);
  const lunchEnd = timeToMinutes(lunchTo);

  // Helper to calculate net unworked minutes in a range (subtracting lunch and intervals)
  const getNetUnworkedMinutes = (start, end) => {
    if (end <= start) return 0;
    let net = end - start;

    // Subtract lunch if applicable
    if (!isLunchConsider) {
      const overlap = Math.max(0, Math.min(end, lunchEnd) - Math.max(start, lunchStart));
      net -= overlap;
    }

    // Subtract intervals
    intervals.forEach(interval => {
      if (!interval.isBreakConsider) {
        const iStart = timeToMinutes(interval.from);
        const iEnd = timeToMinutes(interval.to);
        const overlap = Math.max(0, Math.min(end, iEnd) - Math.max(start, iStart));
        net -= overlap;
      }
    });

    return Math.max(0, net);
  };

  // Calculate working time for a single IN-OUT pair
  const calculatePairWorkingTime = (inPunch, outPunch, workStart, workEnd, isOrphanedOut = false) => {
    // For orphaned OUT punches, we don't calculate working time as they represent
    // a day where the employee forgot to punch IN
    if (isOrphanedOut) {
      return { rawMinutes: 0, finalMinutes: 0, deductions: [] };
    }

    let intervalStart = Math.max(inPunch.time, workStart);
    let intervalEnd = Math.min(outPunch.time, workEnd);

    if (intervalEnd <= intervalStart) return { rawMinutes: 0, finalMinutes: 0, deductions: [] };

    let rawWorkingInterval = intervalEnd - intervalStart;
    let finalWorkingInterval = rawWorkingInterval;
    let intervalDeductions = [];

    if (!isLunchConsider) {
      const lunchStart = timeToMinutes(lunchFrom);
      const lunchEnd = timeToMinutes(lunchTo);
      if (intervalStart < lunchEnd && intervalEnd > lunchStart) {
        const lunchOverlap = Math.min(intervalEnd, lunchEnd) - Math.max(intervalStart, lunchStart);
        finalWorkingInterval -= Math.max(0, lunchOverlap);
        intervalDeductions.push({
          type: 'Lunch',
          deductedMinutes: lunchOverlap,
          reason: 'Lunch break deduction'
        });
      }
    }

    intervals.forEach(interval => {
      if (!interval.isBreakConsider) {
        const breakStart = timeToMinutes(interval.from);
        const breakEnd = timeToMinutes(interval.to);
        if (intervalStart < breakEnd && intervalEnd > breakStart) {
          const breakOverlap = Math.min(intervalEnd, breakEnd) - Math.max(intervalStart, breakStart);
          finalWorkingInterval -= Math.max(0, breakOverlap);
          intervalDeductions.push({
            type: `Break`,
            deductedMinutes: breakOverlap,
            reason: `Break interval ${interval.from} - ${interval.to}`
          });
        }
      }
    });

    return {
      rawMinutes: rawWorkingInterval,
      finalMinutes: Math.max(0, finalWorkingInterval),
      deductions: intervalDeductions,
      totalDeducted: rawWorkingInterval - Math.max(0, finalWorkingInterval)
    };
  };

  // Calculate delay time for a single IN-OUT pair
  const calculatePairDelayTime = (inPunch, outPunch, workStart, workEnd, allPairs, pairIndex, isOrphanedOut = false, isCrossDaySession = false) => {
    let delayDetails = [];
    let totalDelayMinutes = 0;

    // For orphaned OUT punches, treat more conservatively
    if (isOrphanedOut) {
      // NEW LOGIC: Check if there are other actual working punches in the same day
      const hasActualWorkingPunches = allPairs.some(pair => !pair.isOrphanedOut);

      if (hasActualWorkingPunches) {
        delayDetails.push({
          type: 'Orphaned OUT',
          minutes: 0,
          description: `0 mins (cross-day session OUT punch)`
        });
      } else {
        // For early day OUT punches with no actual working punches, treat as full day absent
        let unworkedMinutes = getNetUnworkedMinutes(workStart, workEnd);

        if (unworkedMinutes > 0) {
          totalDelayMinutes += unworkedMinutes;
          delayDetails.push({
            type: 'Unworked Time',
            minutes: unworkedMinutes,
            description: `${Math.round(unworkedMinutes)} mins unworked time (orphaned OUT punch)`
          });
        }
      }

      return {
        totalDelayMinutes,
        delayDetails
      };
    }

    // Get lunch period
    const lunchStart = timeToMinutes(lunchFrom);
    const lunchEnd = timeToMinutes(lunchTo);

    // Calculate late arrival
    if (inPunch.time > workStart && inPunch.time !== outPunch.time) {
      let lateMinutes = 0;
      const isFirstSession = pairIndex === 0;

      if (isFirstSession) {
        if (inPunch.time > lunchStart && inPunch.time < lunchEnd) {
          const missedMorningMinutes = getNetUnworkedMinutes(workStart, lunchStart);
          if (missedMorningMinutes > 0) {
            totalDelayMinutes += missedMorningMinutes;
            delayDetails.push({
              type: 'Missed Morning Work',
              minutes: missedMorningMinutes,
              description: `${Math.round(missedMorningMinutes)} mins missed morning work`
            });
          }
        }
        else if (inPunch.time >= lunchEnd) {
          if (workStart >= lunchEnd) {
            lateMinutes = getNetUnworkedMinutes(workStart, inPunch.time);
          } else {
            const missedMorningMinutes = getNetUnworkedMinutes(workStart, lunchStart);
            if (missedMorningMinutes > 0) {
              totalDelayMinutes += missedMorningMinutes;
              delayDetails.push({
                type: 'Missed Morning Work',
                minutes: missedMorningMinutes,
                description: `${Math.round(missedMorningMinutes)} mins missed morning work`
              });
            }
            const lateAfterLunchMinutes = getNetUnworkedMinutes(lunchEnd, inPunch.time);
            if (lateAfterLunchMinutes > 0) {
              lateMinutes = lateAfterLunchMinutes;
            }
          }
        } else {
          lateMinutes = getNetUnworkedMinutes(workStart, inPunch.time);
        }
      } else {
        let isFirstSessionDuringLunch = false;
        for (let i = 0; i < allPairs.length; i++) {
          if (!allPairs[i].isOrphanedOut) {
            const firstWorkingSessionInTime = allPairs[i].in.time;
            if (firstWorkingSessionInTime > lunchStart && firstWorkingSessionInTime < lunchEnd) {
              isFirstSessionDuringLunch = true;
            }
            break;
          }
        }

        if (!isFirstSessionDuringLunch) {
          let isContinuation = false;
          if (pairIndex > 0) {
            const previousSession = allPairs[pairIndex - 1];
            if (!previousSession.isOrphanedOut) {
              if (previousSession.out.time < lunchStart || previousSession.out.time > lunchEnd) {
                isContinuation = true;
              }
            }
          }

          if (!isContinuation && inPunch.time > lunchEnd) {
            if (workStart < lunchStart) {
              lateMinutes = getNetUnworkedMinutes(lunchEnd, inPunch.time);
            }
          }
          else if (!isContinuation && inPunch.time > workStart && inPunch.time <= lunchStart) {
            lateMinutes = getNetUnworkedMinutes(workStart, inPunch.time);
          }

          if (lateMinutes > 0) {
            totalDelayMinutes += lateMinutes;
            delayDetails.push({
              type: 'Late Arrival',
              minutes: lateMinutes,
              description: `${Math.round(lateMinutes)} mins late arrival`
            });
          }
        }
      }

      if (isFirstSession && lateMinutes > 0) {
        totalDelayMinutes += lateMinutes;
        delayDetails.push({
          type: 'Late Arrival',
          minutes: lateMinutes,
          description: `${Math.round(lateMinutes)} mins late arrival`
        });
      }
    }

    // Early departure
    if (outPunch.time < workEnd && inPunch.time !== outPunch.time) {
      const hasNextSession = pairIndex < allPairs.length - 1;
      let earlyMinutes = 0;

      if (!hasNextSession) {
        let isFirstWorkingSessionDuringLunch = false;
        for (let i = 0; i < allPairs.length; i++) {
          if (!allPairs[i].isOrphanedOut) {
            if (allPairs[i].in.time > lunchStart && allPairs[i].in.time < lunchEnd) {
              isFirstWorkingSessionDuringLunch = true;
            }
            break;
          }
        }

        if (!isFirstWorkingSessionDuringLunch) {
          if (outPunch.time < lunchStart) {
            earlyMinutes = getNetUnworkedMinutes(outPunch.time, lunchStart);
          }
          else if (outPunch.time >= lunchStart && outPunch.time <= lunchEnd) {
            const isLastSession = pairIndex === allPairs.length - 1;
            if (isLastSession) {
              const unworkedAfternoonMinutes = getNetUnworkedMinutes(lunchEnd, workEnd);
              if (unworkedAfternoonMinutes > 0) {
                totalDelayMinutes += unworkedAfternoonMinutes;
                delayDetails.push({
                  type: 'Unworked Afternoon',
                  minutes: unworkedAfternoonMinutes,
                  description: `${Math.round(unworkedAfternoonMinutes)} mins unworked afternoon`
                });
              }
            }
          }
          else if (outPunch.time > lunchEnd && outPunch.time < workEnd) {
            earlyMinutes = getNetUnworkedMinutes(outPunch.time, workEnd);
          }

          if (earlyMinutes > 0) {
            totalDelayMinutes += earlyMinutes;
            delayDetails.push({
              type: 'Early Departure',
              minutes: earlyMinutes,
              description: `${Math.round(earlyMinutes)} mins early departure`
            });
          }
        }
      }
      else {
        if (outPunch.time >= lunchStart && outPunch.time <= lunchEnd) {
          let isLastActualWorkingSession = true;
          for (let i = pairIndex + 1; i < allPairs.length; i++) {
            if (!allPairs[i].isOrphanedOut) {
              isLastActualWorkingSession = false;
              break;
            }
          }

          if (isLastActualWorkingSession) {
            const unworkedAfternoonMinutes = getNetUnworkedMinutes(lunchEnd, workEnd);
            if (unworkedAfternoonMinutes > 0) {
              totalDelayMinutes += unworkedAfternoonMinutes;
              delayDetails.push({
                type: 'Unworked Afternoon',
                minutes: unworkedAfternoonMinutes,
                description: `${Math.round(unworkedAfternoonMinutes)} mins unworked afternoon`
              });
            }
          }
        }
      }

      if (hasNextSession) {
        const nextSession = allPairs[pairIndex + 1];
        const isNextSessionAutoGenerated = nextSession.out.record.isAutoGenerated;
        const doesCurrentSessionEndAfterLunch = outPunch.time > lunchEnd;

        let isFirstSessionAfterLunch = false;
        let isFirstSessionDuringLunch = false;

        for (let i = 0; i < allPairs.length; i++) {
          if (!allPairs[i].isOrphanedOut) {
            const firstWorkingSessionInTime = allPairs[i].in.time;
            if (firstWorkingSessionInTime >= lunchEnd) isFirstSessionAfterLunch = true;
            if (firstWorkingSessionInTime > lunchStart && firstWorkingSessionInTime < lunchEnd) isFirstSessionDuringLunch = true;
            break;
          }
        }

        if (isNextSessionAutoGenerated && doesCurrentSessionEndAfterLunch) {
        } else if (isFirstSessionAfterLunch) {
        } else if (isFirstSessionDuringLunch) {
        }
        else if (outPunch.time >= lunchStart && outPunch.time <= lunchEnd) {
        } else {
          let interPermissionMinutes = getNetUnworkedMinutes(outPunch.time, nextSession.in.time);
          if (interPermissionMinutes > 0) {
            totalDelayMinutes += interPermissionMinutes;
            delayDetails.push({
              type: 'Inter-work Permission',
              minutes: interPermissionMinutes,
              description: `${Math.round(interPermissionMinutes)} mins inter-work permission`
            });
          }
        }
      }
    }

    if (outPunch.record.isAutoGenerated) {
      const MISSING_PUNCH_PENALTY_MINS = 60;
      totalDelayMinutes += MISSING_PUNCH_PENALTY_MINS;
      delayDetails.push({
        type: 'Missing OUT Punch',
        minutes: MISSING_PUNCH_PENALTY_MINS,
        description: `${MISSING_PUNCH_PENALTY_MINS} mins penalty for missing OUT punch`
      });

      const maxPossibleDayDelay = getNetUnworkedMinutes(workStart, workEnd);
      if (totalDelayMinutes > maxPossibleDayDelay) {
        totalDelayMinutes = maxPossibleDayDelay;
      }
    }

    return {
      totalDelayMinutes,
      delayDetails
    };
  };

  standardWorkingMinutes = getNetUnworkedMinutes(workStart, workEnd);

  const filteredData = attendanceData.filter(record => {
    const recordDate = new Date(record.date);
    const from = new Date(fromDate);
    const to = new Date(toDate);
    recordDate.setHours(0, 0, 0, 0);
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);
    return recordDate >= from && recordDate <= to;
  });

  if (filteredData.length === 0 && isSingleDay) {
    return { ...emptyResponse() };
  }

  const originalSalary = worker.salary || 0;
  const allDates = generateDateRange(fromDate, toDate);
  const totalDaysInPeriod = allDates.length;
  const totalSundaysInPeriod = countSundaysInRange(fromDate, toDate);

  // Count holidays that apply to this specific worker
  const totalHolidaysInPeriod = allDates.filter(date => isHolidayForWorker(date, worker._id)).length;
  // FIXED: Working days should only exclude Sundays, not holidays
  // Holidays are paid days but still count as working days for per-day salary calculation
  const totalWorkingDaysInPeriod = totalDaysInPeriod - totalSundaysInPeriod;
  const perDaySalary = totalWorkingDaysInPeriod > 0 ? originalSalary / totalWorkingDaysInPeriod : 0;
  const perMinuteSalary = standardWorkingMinutes > 0 ? perDaySalary / standardWorkingMinutes : 0;
  const totalExpectedMinutes = totalWorkingDaysInPeriod * standardWorkingMinutes;
  let totalWorkingMinutes = 0;
  let totalPermissionMinutes = 0;
  let dailyBreakdown = [];
  let punctualityViolations = 0;
  let report = [];
  let totalAbsentDays = 0;
  let totalSundayCount = 0;
  let totalHolidayCount = 0;

  const groupedByDate = {};
  filteredData.forEach(record => {
    // Parse the string date and convert to consistent YYYY-MM-DD format for grouping
    const recordDate = new Date(record.date);
    const dateKey = recordDate.toISOString().split('T')[0];
    if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
    groupedByDate[dateKey].push(record);
  });

  const processDay = (punches, date) => {
    const dayData = {
      date,
      punchTime: punches.length === 1 ? punches[0].originalTime : `${punches[0].originalTime} - ${punches[punches.length - 1].originalTime}`,
      workingMinutes: 0,
      permissionMinutes: 0,
      salaryDeduction: 0,
      issues: [],
      detailedBreakdown: {
        intervals: [],
        deductions: [],
        permissionDetails: []
      }
    };

    // Sort punches by time
    const sortedPunches = punches.map(record => ({
      time: parseAttendanceTime(record.time),
      originalTime: record.time,
      record
    })).sort((a, b) => a.time - b.time);

    // Pair IN and OUT punches
    const pairs = pairPunches(sortedPunches, workEnd, workEndTime, workStart);

    let dayTotalWorkingMinutes = 0;
    let dayTotalPermissionMinutes = 0;
    let dayTotalDeduction = 0;
    let pairReports = [];

    // Process each IN-OUT pair
    pairs.forEach((pair, index) => {
      const workingTimeResult = calculatePairWorkingTime(pair.in, pair.out, workStart, workEnd, pair.isOrphanedOut);
      const delayTimeResult = calculatePairDelayTime(pair.in, pair.out, workStart, workEnd, pairs, index, pair.isOrphanedOut);

      dayTotalWorkingMinutes += workingTimeResult.finalMinutes;
      dayTotalPermissionMinutes += delayTimeResult.totalDelayMinutes;

      const pairDeduction = deductLateMinutes ? (delayTimeResult.totalDelayMinutes * perMinuteSalary) : 0;
      dayTotalDeduction += pairDeduction;

      // Add to detailed breakdown
      dayData.detailedBreakdown.intervals.push({
        intervalNumber: index + 1,
        inTime: formatTime(pair.in.time),
        outTime: formatTime(pair.out.time),
        rawMinutes: workingTimeResult.rawMinutes,
        finalMinutes: workingTimeResult.finalMinutes,
        deductions: workingTimeResult.deductions,
        totalDeducted: workingTimeResult.totalDeducted
      });

      dayData.detailedBreakdown.deductions.push(...workingTimeResult.deductions);

      delayTimeResult.delayDetails.forEach(detail => {
        dayData.detailedBreakdown.permissionDetails.push({
          type: detail.type,
          totalMinutes: detail.minutes,
          description: detail.description
        });

        dayData.issues.push(`${detail.type}: ${Math.round(detail.minutes)} minutes`);
      });
    });

    // Calculate the day's final salary after all deductions
    const dayFinalSalary = Math.max(0, perDaySalary - dayTotalDeduction);

    // Now create the report entries with the correct total salary
    pairs.forEach((pair, index) => {
      const delayTimeResult = calculatePairDelayTime(pair.in, pair.out, workStart, workEnd, pairs, index, pair.isOrphanedOut);
      const pairDeduction = deductLateMinutes ? (delayTimeResult.totalDelayMinutes * perMinuteSalary) : 0;

      // Add to report only if it's not an orphaned OUT punch that should be hidden
      // OR if it's an orphaned OUT punch but there are no other working punches in the day
      const hasActualWorkingPunches = pairs.some(p => !p.isOrphanedOut);
      const shouldShowOrphanedOut = pair.isOrphanedOut && !hasActualWorkingPunches;
      const shouldHideOrphanedOut = pair.isOrphanedOut && hasActualWorkingPunches;

      // Only add to report if it's not a hidden orphaned OUT punch
      if (!shouldHideOrphanedOut) {
        // Add to report
        const dateFormatted = formatDate(date);
        pairReports.push({
          date: dateFormatted,
          inTime: pair.isOrphanedOut ? 'Absent' : (pair.in.record.isAutoGenerated ? 'Absent' : formatTime(pair.in.time)),
          outTime: pair.out.originalTime,
          delayTime: `${Math.round(delayTimeResult.totalDelayMinutes)} mins`,
          delayType: delayTimeResult.delayDetails.map(d => d.description).join(', '),
          deductionAmount: formatCurrency(pairDeduction),
          // For the total salary, we show the day's final salary after all deductions
          totalSalary: formatCurrency(dayFinalSalary),
          status: pair.isOrphanedOut ? 'Absent' : (pair.out.record.isAutoGenerated ? 'Auto-Out' : 'Present')
        });
      }
    });

    dayData.workingMinutes = dayTotalWorkingMinutes;
    dayData.permissionMinutes = dayTotalPermissionMinutes;
    dayData.salaryDeduction = dayTotalDeduction;

    // Add all pair reports to main report
    report.push(...pairReports);

    totalWorkingMinutes += dayData.workingMinutes;
    totalPermissionMinutes += dayData.permissionMinutes;
    dailyBreakdown.push(dayData);
  };

  const processMissedDay = (date) => {
    const dateString = date.toISOString().split('T')[0];
    const isSundayDay = isSunday(date);
    // NEW: Check if holiday applies to this specific worker
    const holidayInfo = isHolidayForWorker(date, worker._id);

    if (isSundayDay) {
      totalSundayCount++;
      const dayData = {
        date: dateString,
        punchTime: '-',
        workingMinutes: 0,
        permissionMinutes: 0,
        salaryDeduction: 0,
        issues: ['Sunday - Weekly off'],
        detailedBreakdown: { intervals: [], deductions: [], permissionDetails: [] }
      };
      const reportEntry = {
        date: formatDate(dateString),
        outTime: '-',
        inTime: '-',
        delayTime: '-',
        delayType: 'Sunday - Weekly off',
        deductionAmount: formatCurrency(0),
        totalSalary: formatCurrency(0), // Show 0 for Sundays
        status: 'Sunday'
      };
      report.push(reportEntry);
      dailyBreakdown.push(dayData);
    } else if (holidayInfo) {
      totalHolidayCount++;
      const dayData = {
        date: dateString,
        punchTime: '-',
        workingMinutes: 0,
        permissionMinutes: 0,
        salaryDeduction: 0,
        issues: [`Holiday - ${holidayInfo.holidayDesc || 'Public Holiday'}`],
        detailedBreakdown: { intervals: [], deductions: [], permissionDetails: [] }
      };
      const reportEntry = {
        date: formatDate(dateString),
        outTime: '-',
        inTime: '-',
        delayTime: '-',
        delayType: `Holiday - ${holidayInfo.holidayDesc || 'Public Holiday'}`,
        deductionAmount: formatCurrency(0),
        totalSalary: formatCurrency(perDaySalary),
        status: 'Holiday'
      };
      report.push(reportEntry);
      dailyBreakdown.push(dayData);
    } else {
      totalAbsentDays++;
      const dayData = {
        date: dateString,
        punchTime: 'Absent',
        workingMinutes: 0,
        permissionMinutes: 0,
        salaryDeduction: perDaySalary,
        issues: ['Absent - Full day salary deducted'],
        detailedBreakdown: { intervals: [], deductions: [], permissionDetails: [] }
      };
      const reportEntry = {
        date: formatDate(dateString),
        outTime: 'Absent',
        inTime: 'Absent',
        delayTime: 'Full Day',
        delayType: 'Absent - Full day',
        deductionAmount: formatCurrency(perDaySalary),
        totalSalary: formatCurrency(0),
        status: 'Absent'
      };
      report.push(reportEntry);
      dailyBreakdown.push(dayData);
    }
  };

  allDates.forEach(date => {
    // Use consistent date format (YYYY-MM-DD) for matching to match groupedByDate keys
    const dateKey = date.toISOString().split('T')[0];
    const dateString = date.toISOString().split('T')[0];
    if (groupedByDate[dateKey]) {
      const punches = groupedByDate[dateKey];
      if (punches.length > 0) {
        processDay(punches, dateString);
      }
    } else {
      processMissedDay(date);
    }
  });

  const totalDays = dailyBreakdown.length;
  const actualWorkingDays = totalWorkingDaysInPeriod - totalAbsentDays;
  const productivityPercentage = totalExpectedMinutes > 0 ? (totalWorkingMinutes / totalExpectedMinutes) * 100 : 0;
  const averageWorkingHours = actualWorkingDays > 0 ? (totalWorkingMinutes / actualWorkingDays) / 60 : 0;
  const punctualityScore = actualWorkingDays > 0 ? ((actualWorkingDays - punctualityViolations) / actualWorkingDays) * 100 : 0;
  const attendanceRate = totalWorkingDaysInPeriod > 0 ? (actualWorkingDays / totalWorkingDaysInPeriod) * 100 : 0;
  const salaryFromWorkingMinutes = totalWorkingMinutes * perMinuteSalary;
  const totalAbsentDeduction = totalAbsentDays * perDaySalary;

  // Calculate permission deduction by summing only non-absent entries
  // Exclude absent days which are already accounted for in totalAbsentDeduction
  const totalPermissionDeduction = report.reduce((sum, entry) => {
    // Skip absent day entries to avoid double counting
    if (entry.status === 'Absent' && entry.delayTime === 'Full Day') {
      return sum;
    }
    const deduction = parseFloat(entry.deductionAmount.replace('₹', ''));
    return sum + (isNaN(deduction) ? 0 : deduction);
  }, 0);

  const totalSalaryDeduction = totalAbsentDeduction + totalPermissionDeduction;
  const finalSalary = Math.max(0, originalSalary - totalAbsentDeduction - totalPermissionDeduction);
  const finalSummary = {
    "Total Days in Period": totalDaysInPeriod,
    "Total Working Days": totalWorkingDaysInPeriod,
    "Total Sundays": totalSundaysInPeriod,
    "Total Holidays": totalHolidayCount,
    "Total Absent Days": totalAbsentDays,
    "Actual Working Days": actualWorkingDays,
    "Total Working Hours": `${(totalWorkingMinutes / 60).toFixed(2)} hours`,
    "Total Permission Time": `${Math.round(totalPermissionMinutes)} minutes`,
    "Absent Deduction": formatCurrency(totalAbsentDeduction),
    "Permission Deduction": formatCurrency(totalPermissionDeduction),
    "Total Salary Deductions": formatCurrency(totalSalaryDeduction),
    "Attendance Rate": `${attendanceRate.toFixed(1)}%`,
    "Final Salary": formatCurrency(finalSalary)
  };
  console.log(finalSummary);
  return {
    totalDays,
    workingDays: actualWorkingDays,
    totalWorkingHours: totalWorkingMinutes / 60,
    averageWorkingHours,
    totalPermissionTime: totalPermissionMinutes,
    totalSalaryDeduction,
    totalAbsentDays,
    totalSundayCount: totalSundaysInPeriod,
    totalHolidayCount,
    productivityPercentage,
    dailyBreakdown: dailyBreakdown.map(day => ({
      ...day,
      workingHours: day.workingMinutes / 60,
      permissionTime: day.permissionMinutes,
      workingTimeDisplay: day.workingMinutes > 0 ? minutesToTime(day.workingMinutes) : '-',
      permissionTimeDisplay: day.permissionMinutes > 0 ? minutesToTime(day.permissionMinutes) : '-',
      daySalaryFromMinutes: day.workingMinutes * perMinuteSalary,
      expectedDaySalary: perDaySalary
    })),
    summary: {
      punctualityScore,
      attendanceRate,
      finalSalary,
      originalSalary,
      originalSalaryForPeriod: originalSalary,
      salaryFromWorkingMinutes,
      perMinuteSalary,
      perDaySalary,
      totalWorkingDaysInPeriod,
      totalDaysInPeriod,
      totalSundaysInPeriod,
      totalHolidaysInPeriod,
      totalAbsentDays,
      actualWorkingDays,
      absentDeduction: totalAbsentDeduction,
      permissionDeduction: totalPermissionDeduction,
      worker: {
        name: worker.name || '',
        username: worker.username || '',
        rfid: worker.rfid || '',
        department: worker.department || '',
        email: worker.email || '',
        salary: worker.salary || 0
      }
    },
    configuration: {
      considerOvertime,
      deductSalary,
      workStartTime,
      workEndTime,
      lunchStartTime: lunchFrom,
      lunchEndTime: lunchTo,
      permissionTimeMinutes,
      salaryDeductionPerBreak,
      standardWorkingMinutesPerDay: standardWorkingMinutes
    },
    finalSummary,
    report: report.sort((a, b) => {
      // Sort by date first, then by time
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }
      // If same date, sort by inTime chronologically
      // Convert time strings to minutes for proper comparison
      const timeToMinutes = (timeStr) => {
        if (!timeStr || timeStr === 'Absent') return 0;
        const [time, period] = timeStr.split(' ');
        const [hours, minutes] = time.split(':').map(Number);

        let totalMinutes = hours * 60 + minutes;

        if (period === 'AM') {
          if (hours === 12) totalMinutes -= 12 * 60;
        } else if (period === 'PM') {
          if (hours !== 12) totalMinutes += 12 * 60;
        }

        return totalMinutes;
      };

      const timeA = timeToMinutes(a.inTime);
      const timeB = timeToMinutes(b.inTime);

      return timeA - timeB;
    })
  };
};

function emptyResponse() {
  return {
    totalDays: 0,
    workingDays: 0,
    totalWorkingHours: 0,
    averageWorkingHours: 0,
    totalPermissionTime: 0,
    totalSalaryDeduction: 0,
    totalAbsentDays: 0,
    totalSundayCount: 0,
    totalHolidayCount: 0,
    productivityPercentage: 0,
    dailyBreakdown: [],
    summary: {
      punctualityScore: 0,
      attendanceRate: 0,
      finalSalary: 0,
      originalSalary: 0,
      perMinuteSalary: 0,
      totalWorkingDaysInPeriod: 0,
      totalDaysInPeriod: 0,
      totalSundaysInPeriod: 0,
      totalHolidaysInPeriod: 0,
      totalAbsentDays: 0,
      actualWorkingDays: 0,
      absentDeduction: 0,
      permissionDeduction: 0,
      worker: {
        name: '',
        username: '',
        rfid: '',
        department: '',
        email: '',
        salary: 0
      }
    },
    configuration: {},
    finalSummary: {
      "Total Days in Period": 0,
      "Total Working Days": 0,
      "Total Sundays": 0,
      "Total Holidays": 0,
      "Total Absent Days": 0,
      "Actual Working Days": 0,
      "Total Working Hours": "0 hours",
      "Total Permission Time": "0 minutes",
      "Absent Deduction": "₹0.00",
      "Permission Deduction": "₹0.00",
      "Total Salary Deductions": "₹0.00",
      "Attendance Rate": "0%",
      "Final Salary": "₹0.00"
    },
    report: []
  };
}

module.exports = {
  calculateWorkerProductivity
};