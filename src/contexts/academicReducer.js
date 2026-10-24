import { STATUSES } from "../logic/assignments";
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
    SAVE_DATA: "SAVE_DATA"
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

    validateData(data);

    return data;
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
    const { assignments, classes } = data;
    for (const assignmentId in assignments) {
        const assignment = assignments[assignmentId];
        if (assignment.uuid != assignmentId) {
            assignment.uuid = assignmentId;
        }
        if (!("status" in assignment)) assignment.status = STATUSES.NOT_STARTED;
        if ("dueDate" in assignment) assignment.dueDate = new Date(assignment.dueDate);
        if (assignment.openDate == null) assignment.openDate = new Date();
        else assignment.openDate = new Date(assignment.openDate);
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

    debugging.log("Added assignment:", assignmentData);

    storage.setItem("assignments", newState.assignments);
    return newState;
}

function updateAssignment(state, uuid, changes) {
    if (!changes) {
        debugging.error("no assignment changes");
        return state;
    }
    const newState = Object.assign({}, state);
    newState.assignments = Object.assign({}, newState.assignments);
    newState.assignments[uuid] = Object.assign({}, newState.assignments[uuid], changes);

    debugging.log("Modified assignment:", newState.assignments[uuid]);

    storage.setItem("assignments", newState.assignments);
    return newState;
}

function deleteAssignment(state, uuid) {
    const newState = Object.assign({}, state);
    newState.assignments = Object.assign({}, newState.assignments);
    delete newState.assignments[uuid];
    return newState;
}
