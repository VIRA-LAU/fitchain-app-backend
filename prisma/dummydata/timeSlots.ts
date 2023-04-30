export const timeSlots = [];

for (var i = 0; i < 24; i++) {
  timeSlots.push({
    startTime: `${('0' + i).slice(-2)}:00`,
    endTime: `${('0' + i).slice(-2)}:30`,
  });
  timeSlots.push({
    startTime: `${('0' + i).slice(-2)}:30`,
    endTime: `${('0' + (i + 1)).slice(-2)}:00`,
  });
  timeSlots.push({
    startTime: `${('0' + i).slice(-2)}:00`,
    endTime: `${('0' + (i + 1)).slice(-2)}:00`,
  });
}
