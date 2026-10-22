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

export const ASSIGNMENT_FLAGS = Object.freeze({
    MISSING_NAME: 1 << 0,
    MISSING_CLASS: 1 << 1,
    MISSING_DUE_DATE: 1 << 2,
    OPEN_AFTER_DUE: 1 << 3,
    START_AFTER_DUE: 1 << 4
});

export function groupSections(assignments, now) {
    const groupings = {};
    for (const assignment of assignments) {
        const section = getSection(assignment, now);

        if (!(section in groupings)) groupings[section] = [];

        groupings[section].push(assignment);
    }
    return groupings;
}

export function getSection(assignment, now) {
    // TODO: check if class is dropped, then return DROPPED;
    if (assignment.status == STATUSES.COMPLETE) return SECTIONS.COMPLETE;

    const overdue = assignment.dueDate <= now;
    if (overdue) return SECTIONS.OVERDUE;

    if (!assignment.openDate || assignment.openDate <= now || assignment.status == STATUSES.IN_PROGRESS) return SECTIONS.ACTIVE;

    return SECTIONS.NOT_OPEN;
}

export function getStartingStatus(openDate, now) {
    if (openDate > now) return STATUSES.NOT_STARTED;
    return STATUSES.NOT_STARTED;
}

export function validateAssignment(assignment) {
    let flags = 0;

    if (!assignment.name) flags |= ASSIGNMENT_FLAGS.MISSING_NAME;
    if (!assignment.class) flags |= ASSIGNMENT_FLAGS.MISSING_CLASS;
    if (!assignment.dueDate) flags |= ASSIGNMENT_FLAGS.MISSING_DUE_DATE;
    if (assignment.openDate && assignment.openDate >= assignment.dueDate) flags |= ASSIGNMENT_FLAGS.OPEN_AFTER_DUE;
    if (assignment.startDate && assignment.startDate >= assignment.dueDate) flags |= ASSIGNMENT_FLAGS.START_AFTER_DUE;

    return flags;
}
