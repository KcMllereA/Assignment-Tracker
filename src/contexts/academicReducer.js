import { STATUSES } from "../logic/assignments";
import debugging from "../util/debug";
import * as storage from "../util/storage";

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
            return updateAssignment(state);
        case ACTIONS.DELETE_ASSIGNMENT:
            return deleteAssignment(state);
        default:
            return state;
    }
}

function loadData() {
    // Ensure no missing data
    if (!storage.containsKey("assignments")) {
        storage.setItem("assignments", []);
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

function validateData({ assignments }) {
    assignments.forEach((assignment) => {
        if (!("status" in assignment)) assignment.status = STATUSES.NOT_STARTED;
    });
}

function saveData({ assignments, classes, calendar, user }) {
    storage.setItem("assignments", assignments);
    storage.setItem("classes", classes);
    storage.setItem("calendar", calendar);
    storage.setItem("user", user);
}

function addClass(state, classData) {
    const newState = { ...state };
    newState.classes[classData.uniqueId] = classData;

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
    const newState = { ...state };
    newState.assignments = newState.assignments.concat(assignmentData);

    debugging.log("Added assignment:", assignmentData);

    storage.setItem("assignments", newState.assignments);
    return newState;
}

function updateAssignment(state) {
    return state;
}

function deleteAssignment(state) {
    return state;
}
