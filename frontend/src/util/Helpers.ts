import { models } from "../../wailsjs/go/models";

export const to12HourFormat = (time: models.Time) => {
    const ampm = time.hour >= 12 ? "PM" : "AM";
    const hour12 = time.hour % 12 || 12;
    return `${hour12}:${time.minute.toString().padStart(2, "0")} ${ampm}`;
};

export const to24HourFormat = (time: models.Time) => {
    return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
};

export const toMinutesOfDay = (time: models.Time) => {
    return time.hour * 60 + time.minute;
};

export const fullRouteName = (route: models.Route) => {
    return `${route.departure} - ${route.destination}`;
};

export const generateCounterKey = (route: models.Route, stop: models.Stop, time: models.Time, isGold: boolean) => {
    let key = `${fullRouteName(route).toLowerCase()}-${stop.name.toLowerCase()}-${to24HourFormat(time)}`;
    if (isGold) {
        key += "-gold";
    }
    return key;
}

export const generateCounterPrefixesKeys = (route: models.Route, time: models.Time) => {
    return route.stops.map((stop) => generateCounterKey(route, stop, time, false));
};

export const nextDeparture = (route: models.Route, timetable: "normal" | "holiday") => {
    const times = timetable === "holiday" ? route.holiday_timetable : route.timetable;

    const now = new Date();
    const currentTime = new models.Time({
        hour: now.getHours(),
        minute: now.getMinutes(),
    });
    
    const currentTimeInMinutes = toMinutesOfDay(currentTime);
    const sortedTimes = times
        .map((time: models.Time) => ({
            time,
            minutes: toMinutesOfDay(time),
        }))
        .filter(({ minutes }: { minutes: number }) => minutes >= currentTimeInMinutes)
        .sort((a: { minutes: number }, b: { minutes: number }) => a.minutes - b.minutes);
    return sortedTimes.length > 0 ? sortedTimes[0].time : times[0];
};

export const calculateRemainingTime = (selectedTime: models.Time) => {
    const now = new Date();
    const currentTime = new models.Time({
        hour: now.getHours(),
        minute: now.getMinutes(),
    });
    
    const currentMinutes = toMinutesOfDay(currentTime);
    const selectedMinutes = toMinutesOfDay(selectedTime);
    
    let diffMinutes = selectedMinutes - currentMinutes;
    
    // If the selected time is earlier than current time, it means it's for tomorrow
    if (diffMinutes < 0) {
        diffMinutes += 24 * 60; // Add 24 hours worth of minutes
    }
    
    // Convert to hours and minutes
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    // Format the output
    if (hours === 0 && minutes === 0) {
        return "¡Ya es hora!";
    } else if (hours === 0) {
        return `Sale en ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    } else if (minutes === 0) {
        return `Sale en ${hours} hora${hours !== 1 ? 's' : ''}`;
    } else {
        return `Sale en ${hours}h ${minutes}m`;
    }
};
