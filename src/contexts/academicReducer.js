import { addAssignmentToSections, groupSections, refreshAssignmentSections, removeAssignmentFromSections, SECTIONS, STATUSES, updateAssignmentInSections } from "../logic/assignments";
import debugging from "../util/debug";
import * as storage from "../util/storage";
import { genUUID, unusedUUID } from "../util/uuid";

export const ACTIONS = Object.freeze({
    LOAD_DATA: "LOAD_DATA",
    ADD_CLASS: "ADD_CLASS",
    UPDATE_CLASS: "UPDATE_CLASS",
    DELETE_CLASS: "DELETE_CLASS",
    ADD_TYPE: "ADD_TYPE",
    ADD_ASSIGNMENT: "ADD_ASSIGNMENT",
    UPDATE_ASSIGNMENT: "UPDATE_ASSIGNMENT",
    DELETE_ASSIGNMENT: "DELETE_ASSIGNMENT",
    SAVE_DATA: "SAVE_DATA",
    TOGGLE_SECTION: "TOGGLE_SECTION",
    REFRESH_ASSIGNMENT_SECTIONS: "REFRESH_ASSIGNMENT_SECTIONS"
});

export default function academicReducer(state, { type, payload: data }) {
    switch (type) {
        case ACTIONS.LOAD_DATA:
            return loadData();
        case ACTIONS.SAVE_DATA:
            return saveData(state);
        case ACTIONS.ADD_CLASS:
            return addClass(state, data);
        case ACTIONS.UPDATE_CLASS:
            return updateClass(state);
        case ACTIONS.DELETE_CLASS:
            return deleteClass(state);
        case ACTIONS.ADD_TYPE:
            return addType(state);
        case ACTIONS.ADD_ASSIGNMENT:
            return addAssignment(state, data);
        case ACTIONS.UPDATE_ASSIGNMENT:
            return updateAssignment(state, data.uuid, data.changes);
        case ACTIONS.DELETE_ASSIGNMENT:
            return deleteAssignment(state, data);
        case ACTIONS.TOGGLE_SECTION:
            return toggleSection(state, data);
        case ACTIONS.REFRESH_ASSIGNMENT_SECTIONS:
            return refreshSections(state, data);
    }
    return state;
}

function loadData() {
    // Ensure no missing data
    if (!storage.containsKey("assignments")) {
        storage.setItem("assignments", {});
    }
    if (!storage.containsKey("classes")) {
        storage.setItem("classes", {});
    }
    if (!storage.containsKey("calendar")) {
        storage.setItem("calendar", {});
    }
    if (!storage.containsKey("user")) {
        storage.setItem("user", {});
    }

    const data = {
        assignments: storage.getItem("assignments"),
        classes: storage.getItem("classes"),
        calendar: storage.getItem("calendar"),
        user: storage.getItem("user")
    };

    if (import.meta.env.DEV) validateData(data);

    return {
        ...data,
        groupedAssignments: groupSections(data.assignments, Date.now())
    };
}

function validateData(data) {
    if (Array.isArray(data.assignments)) {
        const assignments = {};
        for (const assignment of data.assignments) {
            let uuid = genUUID();
            while (uuid in assignments) uuid = genUUID();
            assignments[uuid] = assignment;
        }
        data.assignments = assignments;
    }
    const { assignments, classes, user } = data;
    if (!user.openedSections) {
        user.openedSections = {};
        for (const section in SECTIONS) {
            user.openedSections[SECTIONS[section]] = false;
        }
        user.openedSections[SECTIONS.ACTIVE] = true;
        user.openedSections[SECTIONS.OVERDUE] = true;
    }
    const NOW = new Date();
    for (const assignmentId in assignments) {
        const assignment = assignments[assignmentId];
        if (assignment.uuid != assignmentId) {
            assignment.uuid = assignmentId;
        }
        if (!("status" in assignment)) assignment.status = STATUSES.NOT_STARTED;
        if ("dueDate" in assignment) assignment.dueDate = new Date(assignment.dueDate);
        else assignment.dueDate = new Date();

        if (NOW.getTime() + 7 * 24 * 60 * 60 * 1000 < assignment.dueDate.getTime()) {
            assignment.openDate = new Date(assignment.dueDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else {
            if (assignment.openDate == null) {
                assignment.openDate = new Date();
            } else {
                assignment.openDate = new Date(assignment.openDate);
            }
        }
    }
    for (const classId in classes) {
        const course = classes[classId];
        if (!("lectures" in course)) {
            course.lectures = {};
        }
        if ("startDate" in course.lectures) course.lectures.startDate = new Date(course.lectures.startDate);
        if ("endDate" in course.lectures) course.lectures.endDate = new Date(course.lectures.endDate);
    }
}

function saveData({ assignments, classes, calendar, user }) {
    storage.setItem("assignments", assignments);
    storage.setItem("classes", classes);
    storage.setItem("calendar", calendar);
    storage.setItem("user", user);
}

function addClass(state, classData) {
    const newState = Object.assign({}, state);
    Object.assign(newState.classes, { [classData.semester + "-" + classData.uniqueId]: classData });

    storage.setItem("classes", newState.classes);
    return newState;
}

function updateClass(state) {
    return state;
}

function deleteClass(state) {
    return state;
}

function addType(state) {
    return state;
}

function addAssignment(state, assignmentData) {
    const newState = Object.assign({}, state);
    assignmentData.status = STATUSES.NOT_STARTED;

    const uuid = unusedUUID(newState.assignments);
    assignmentData.uuid = uuid;
    newState.assignments = Object.assign(
        {
            [uuid]: assignmentData
        },
        newState.assignments
    );
    newState.groupedAssignments = addAssignmentToSections(newState.groupedAssignments, uuid, newState.assignments, Date.now());

    debugging.log("Added assignment:", assignmentData);

    storage.setItem("assignments", newState.assignments);
    return newState;
}

function updateAssignment(state, uuid, changes) {
    if (!changes) {
        debugging.error("no assignment changes");
        return state;
    }

    const previousAssignment = state.assignments[uuid];
    if (previousAssignment) {
        let changed = false;
        for (const change in changes) {
            if (previousAssignment[change] != changes[change]) {
                changed = true;
                break;
            }
        }
        if (!changed) return state;
    }

    const now = Date.now();
    state.assignments[uuid] = Object.assign({}, state.assignments[uuid], changes);

    state.groupedAssignments = previousAssignment
        ? updateAssignmentInSections(state.groupedAssignments, uuid, state.assignments, now)
        : addAssignmentToSections(state.groupedAssignments, uuid, state.assignments, now);

    debugging.log("Modified assignment:", state.assignments[uuid]);

    storage.setItem("assignments", state.assignments);
    return state;
}

function deleteAssignment(state, uuid) {
    const newState = Object.assign({}, state);
    newState.assignments = Object.assign({}, newState.assignments);
    const assignment = newState.assignments[uuid];
    delete newState.assignments[uuid];
    if (assignment) newState.groupedAssignments = removeAssignmentFromSections(newState.groupedAssignments, uuid);
    storage.setItem("assignments", newState.assignments);
    return newState;
}

function refreshSections(state, now) {
    const groupedAssignments = refreshAssignmentSections(state.groupedAssignments, state.assignments, now);
    if (groupedAssignments === state.groupedAssignments) return state;
    return { ...state, groupedAssignments };
}

function toggleSection(state, { section, state: toggle }) {
    const newState = Object.assign({}, state);
    newState.user.openedSections = Object.assign({}, newState.user.openedSections);
    newState.user.openedSections[section] = toggle;
    storage.setItem("user", newState.user);
    return newState;
}
