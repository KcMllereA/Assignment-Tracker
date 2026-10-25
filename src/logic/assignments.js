export const SECTIONS = Object.freeze({
    NOT_OPEN: "Upcoming",
    ACTIVE: "Active",
    COMPLETE: "Completed",
    OVERDUE: "Overdue",
    DROPPED: "Dropped"
});

export const STATUSES = Object.freeze({
    NOT_STARTED: "Not Started",
    IN_PROGRESS: "In Progress",
    COMPLETE: "Completed",
    STALLED: "Stalled"
});

export const STATUS_COLORS = Object.freeze({
    [STATUSES.NOT_STARTED]: "grey",
    [STATUSES.IN_PROGRESS]: "yellow",
    [STATUSES.COMPLETE]: "lime",
    [STATUSES.STALLED]: "red"
});

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;
export const DUE_DATE_COLORS = Object.freeze({
    [0]: "red",
    [ONE_WEEK]: "yellow",
    [ONE_WEEK * 2]: "lime"
});

export function getDueDateMix(timeRemaining = 0) {
    const times = Object.keys(DUE_DATE_COLORS)
        .map(Number)
        .sort((a, b) => a - b);

    if (timeRemaining <= times[0]) return DUE_DATE_COLORS[times[0]];
    if (timeRemaining >= times[times.length - 1]) return DUE_DATE_COLORS[times[times.length - 1]];

    for (let i = 1; i < times.length; i++) {
        const upper = times[i];
        if (timeRemaining <= upper) {
            const lower = times[i - 1];
            const upperPercentage = ((timeRemaining - lower) / (upper - lower)) * 100;
            const lowerPercentage = 100 - upperPercentage;

            if (upperPercentage === 0) return DUE_DATE_COLORS[lower];
            if (lowerPercentage === 0) return DUE_DATE_COLORS[upper];

            return `color-mix(in oklab, ${DUE_DATE_COLORS[lower]} ${lowerPercentage}%, ${DUE_DATE_COLORS[upper]} ${upperPercentage}%)`;
        }
    }
}

export const ASSIGNMENT_FLAGS = Object.freeze({
    MISSING_NAME: 1 << 0,
    MISSING_CLASS: 1 << 1,
    MISSING_DUE_DATE: 1 << 2,
    OPEN_AFTER_DUE: 1 << 3,
    START_AFTER_DUE: 1 << 4
});

export function groupSections(assignments, now) {
    const groupings = {};
    for (const assignmentId in assignments) {
        const assignment = assignments[assignmentId];
        const section = getSection(assignment, now);

        if (!(section in groupings)) groupings[section] = [];

        groupings[section].push(assignment);
    }
    for (const group in groupings) {
        groupings[group].sort(group == SECTIONS.COMPLETE ? (a, b) => b.dueDate - a.dueDate : group == SECTIONS.NOT_OPEN ? (a, b) => a.openDate - b.openDate : (a, b) => a.dueDate - b.dueDate);
    }
    return groupings;
}

export function getSection(assignment, now) {
    // TODO: check if class is dropped, then return DROPPED;
    if (assignment.status == STATUSES.COMPLETE) return SECTIONS.COMPLETE;

    const overdue = assignment.dueDate <= now;
    if (overdue) return SECTIONS.OVERDUE;

    // if (assignment.dueDate > now + ONE_WEEK) return SECTIONS.NOT_OPEN;

    if (!assignment.openDate || assignment.openDate <= now || assignment.status == STATUSES.IN_PROGRESS) return SECTIONS.ACTIVE;

    return SECTIONS.NOT_OPEN;
}

export function getStartingStatus(openDate, now) {
    if (openDate > now) return STATUSES.NOT_STARTED;
    return STATUSES.NOT_STARTED;
}

export function checkAssignment(assignment) {
    let flags = 0;

    if (!assignment.name) flags |= ASSIGNMENT_FLAGS.MISSING_NAME;
    if (!assignment.class) flags |= ASSIGNMENT_FLAGS.MISSING_CLASS;
    if (!assignment.dueDate) flags |= ASSIGNMENT_FLAGS.MISSING_DUE_DATE;
    if (assignment.openDate && assignment.openDate >= assignment.dueDate) flags |= ASSIGNMENT_FLAGS.OPEN_AFTER_DUE;
    if (assignment.startDate && assignment.startDate >= assignment.dueDate) flags |= ASSIGNMENT_FLAGS.START_AFTER_DUE;

    return flags;
}
