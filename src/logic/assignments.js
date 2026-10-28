export const SECTIONS = Object.freeze({
    NOT_OPEN: "Upcoming",
    ACTIVE: "Active",
    COMPLETE: "Completed",
    OVERDUE: "Overdue",
    DROPPED: "Dropped",
    STALLED: "Stalled"
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

            if (upperPercentage == 0) return DUE_DATE_COLORS[lower];
            if (lowerPercentage == 0) return DUE_DATE_COLORS[upper];

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
    for (const uuid in assignments) {
        const assignment = assignments[uuid];
        const section = getSection(assignment, now);

        if (!(section in groupings)) groupings[section] = [];

        groupings[section].push(uuid);
    }
    for (const group in groupings) {
        groupings[group].sort(compareAssignmentUUIDS(assignments, group));
    }
    return groupings;
}

export function addAssignmentToSections(groupings, uuid, assignments, now) {
    const assignment = assignments[uuid];
    const section = getSection(assignment, now);
    const updated = { ...groupings };
    const sectionAssignments = [...(updated[section] ?? [])];
    insertSorted(sectionAssignments, uuid, assignments, section);
    updated[section] = sectionAssignments;
    return updated;
}

export function updateAssignmentInSections(groupings, uuid, assignments, now) {
    return addAssignmentToSections(removeAssignmentFromSections(groupings, uuid), uuid, assignments, now);
}

export function removeAssignmentFromSections(groupings, uuid) {
    const updated = { ...groupings };
    for (const section in updated) {
        const index = updated[section].indexOf(uuid);
        if (index == -1) continue;

        const sectionAssignments = [...updated[section]];
        sectionAssignments.splice(index, 1);
        if (sectionAssignments.length == 0) delete updated[section];
        else updated[section] = sectionAssignments;
        break;
    }
    return updated;
}

export function refreshAssignmentSections(groupings, assignments, now) {
    const currentSections = {};
    for (const section in groupings) {
        for (const uuid of groupings[section]) {
            currentSections[uuid] = section;
        }
    }

    const moving = [];
    const movingUUIDS = new Set();
    for (const uuid in assignments) {
        const assignment = assignments[uuid];
        const section = currentSections[uuid];
        const nextSection = getSection(assignment, now);
        if (section && section != nextSection) {
            moving.push({ uuid, nextSection });
            movingUUIDS.add(uuid);
        }
    }

    if (moving.length == 0) return groupings;

    const updated = {};
    for (const section in groupings) {
        const remaining = groupings[section].filter((uuid) => !movingUUIDS.has(uuid));
        if (remaining.length > 0) updated[section] = remaining;
    }
    for (const { uuid, nextSection } of moving) {
        const sectionAssignments = updated[nextSection] ?? [];
        insertSorted(sectionAssignments, uuid, assignments, nextSection);
        updated[nextSection] = sectionAssignments;
    }
    return updated;
}

function compareAssignmentUUIDS(assignments, section) {
    const compare = compareAssignments(section);
    return (a, b) => compare(assignments[a], assignments[b]);
}

function compareAssignments(section) {
    if (section == SECTIONS.COMPLETE) return (a, b) => b.dueDate - a.dueDate;
    if (section == SECTIONS.NOT_OPEN) return (a, b) => a.openDate - b.openDate;
    return (a, b) => a.dueDate - b.dueDate;
}

function insertSorted(uuids, uuid, assignments, section) {
    const compare = compareAssignmentUUIDS(assignments, section);
    let low = 0;
    let high = uuids.length;
    while (low < high) {
        const middle = Math.floor((low + high) / 2);
        if (compare(uuids[middle], uuid) <= 0) low = middle + 1;
        else high = middle;
    }
    uuids.splice(low, 0, uuid);
}

export function getSection(assignment, now) {
    // TODO: check if class is dropped, then return DROPPED;
    if (assignment.status == STATUSES.COMPLETE) return SECTIONS.COMPLETE;

    const overdue = assignment.dueDate <= now;
    if (overdue) return SECTIONS.OVERDUE;

    if (assignment.status == STATUSES.STALLED) return SECTIONS.STALLED;

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
