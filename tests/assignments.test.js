import { describe, expect, it } from "vitest";
import {
    addAssignmentToSections,
    ASSIGNMENT_FLAGS,
    DUE_DATE_COLORS,
    getSection,
    getDueDateMix,
    getStartingStatus,
    groupSections,
    refreshAssignmentSections,
    removeAssignmentFromSections,
    SECTIONS,
    STATUSES,
    checkAssignment,
    updateAssignmentInSections
} from "../src/logic/assignments";

const WEEK = 7 * 24 * 60 * 60 * 1000;

describe("getDueDateMix", () => {
    it("returns the closest boundary color outside the configured range", () => {
        expect(getDueDateMix()).toBe("red");
        expect(getDueDateMix(-1)).toBe("red");
        expect(getDueDateMix(2 * WEEK)).toBe("lime");
        expect(getDueDateMix(Infinity)).toBe("lime");
    });

    it("returns exact colors at each configured stop", () => {
        expect(getDueDateMix(0)).toBe(DUE_DATE_COLORS[0]);
        expect(getDueDateMix(WEEK)).toBe(DUE_DATE_COLORS[WEEK]);
        expect(getDueDateMix(2 * WEEK)).toBe(DUE_DATE_COLORS[2 * WEEK]);
    });

    it("interpolates in Oklab between adjacent colors", () => {
        expect(getDueDateMix(WEEK / 2)).toBe("color-mix(in oklab, red 50%, yellow 50%)");
        expect(getDueDateMix(WEEK + WEEK / 2)).toBe("color-mix(in oklab, yellow 50%, lime 50%)");
        expect(getDueDateMix(WEEK / 4)).toBe("color-mix(in oklab, red 75%, yellow 25%)");
    });
});

describe("getSection", () => {
    const now = new Date("2026-01-01T00:00:00Z");

    it("classifies completed assignments before checking their due dates", () => {
        expect(getSection({ status: STATUSES.COMPLETE, dueDate: new Date(now.getTime() - 1), openDate: now }, now)).toBe(SECTIONS.COMPLETE);
    });

    it("classifies assignments due at or before now as overdue", () => {
        expect(getSection({ dueDate: now, openDate: now }, now)).toBe(SECTIONS.OVERDUE);
        expect(getSection({ dueDate: new Date(now.getTime() - 1), openDate: now }, now)).toBe(SECTIONS.OVERDUE);
    });

    it("classifies assignments as active when they have opened or have no open date", () => {
        expect(getSection({ dueDate: new Date(now.getTime() + 1), openDate: now }, now)).toBe(SECTIONS.ACTIVE);
        expect(getSection({ dueDate: new Date(now.getTime() + 1) }, now)).toBe(SECTIONS.ACTIVE);
    });

    it("keeps future unopened assignments upcoming unless already in progress", () => {
        const dueDate = new Date(now.getTime() + WEEK);
        const openDate = new Date(now.getTime() + 1);

        expect(getSection({ dueDate, openDate, status: STATUSES.NOT_STARTED }, now)).toBe(SECTIONS.NOT_OPEN);
        expect(getSection({ dueDate, openDate, status: STATUSES.IN_PROGRESS }, now)).toBe(SECTIONS.ACTIVE);
    });
});

describe("groupSections", () => {
    it("groups assignments by section and sorts each group by due date", () => {
        const now = new Date("2026-01-01T00:00:00Z");
        const overdueLater = { dueDate: new Date(now.getTime() - 1000), openDate: now };
        const overdueEarlier = { dueDate: new Date(now.getTime() - 2000), openDate: now };
        const active = { dueDate: new Date(now.getTime() + 1000), openDate: now };
        const upcoming = {
            dueDate: new Date(now.getTime() + WEEK),
            openDate: new Date(now.getTime() + 1000),
            status: STATUSES.NOT_STARTED
        };

        expect(groupSections({ a: overdueLater, b: active, c: overdueEarlier, d: upcoming }, now)).toEqual({
            [SECTIONS.OVERDUE]: ["c", "a"],
            [SECTIONS.ACTIVE]: ["b"],
            [SECTIONS.NOT_OPEN]: ["d"]
        });
    });

    it("returns no groups for an empty assignment collection", () => {
        expect(groupSections({}, new Date())).toEqual({});
    });
});

describe("incremental assignment sections", () => {
    const now = new Date("2026-01-01T00:00:00Z");

    it("adds assignments into their section in sorted order", () => {
        const later = { uuid: "later", dueDate: new Date(now.getTime() + 2000), openDate: now };
        const earlier = { uuid: "earlier", dueDate: new Date(now.getTime() + 1000), openDate: now };
        const assignments = { later, earlier };
        const groups = addAssignmentToSections(addAssignmentToSections({}, "later", assignments, now), "earlier", assignments, now);

        expect(groups[SECTIONS.ACTIVE]).toEqual(["earlier", "later"]);
    });

    it("moves updated assignments between sections and restores sorted order", () => {
        const first = { uuid: "first", dueDate: new Date(now.getTime() + 1000), openDate: now };
        const second = { uuid: "second", dueDate: new Date(now.getTime() + 2000), openDate: now };
        const groups = groupSections({ first, second }, now);
        const updated = { ...first, dueDate: new Date(now.getTime() + 3000) };
        const assignments = { first: updated, second };
        const nextGroups = updateAssignmentInSections(groups, "first", assignments, now);

        expect(nextGroups[SECTIONS.ACTIVE]).toEqual(["second", "first"]);
        expect(groups[SECTIONS.ACTIVE]).toEqual(["first", "second"]);
    });

    it("removes empty sections when deleting the last assignment", () => {
        const assignment = { uuid: "only", dueDate: new Date(now.getTime() + 1000), openDate: now };

        expect(removeAssignmentFromSections(groupSections({ only: assignment }, now), "only")).toEqual({});
    });

    it("moves only time-reclassified assignments when refreshing sections", () => {
        const upcoming = {
            uuid: "upcoming",
            dueDate: new Date(now.getTime() + 2000),
            openDate: new Date(now.getTime() + 1000),
            status: STATUSES.NOT_STARTED
        };
        const active = { uuid: "active", dueDate: new Date(now.getTime() + 3000), openDate: now };
        const assignments = { upcoming, active };
        const groups = groupSections(assignments, now);
        const nextNow = new Date(now.getTime() + 1500);
        const nextGroups = refreshAssignmentSections(groups, assignments, nextNow);

        expect(nextGroups[SECTIONS.NOT_OPEN]).toBeUndefined();
        expect(nextGroups[SECTIONS.ACTIVE]).toEqual(["upcoming", "active"]);
        expect(groups[SECTIONS.NOT_OPEN]).toEqual(["upcoming"]);
    });
});

describe("getStartingStatus", () => {
    it("returns the not-started status for future and past opening dates", () => {
        const now = new Date("2026-01-01T00:00:00Z");

        expect(getStartingStatus(new Date(now.getTime() + 1), now)).toBe(STATUSES.NOT_STARTED);
        expect(getStartingStatus(new Date(now.getTime() - 1), now)).toBe(STATUSES.NOT_STARTED);
    });
});

describe("checkAssignment", () => {
    it("returns no flags for an assignment with valid required dates and fields", () => {
        expect(
            checkAssignment({
                name: "Essay",
                class: "class-1",
                openDate: new Date("2026-01-01T00:00:00Z"),
                dueDate: new Date("2026-01-03T00:00:00Z"),
                startDate: new Date("2026-01-02T00:00:00Z")
            })
        ).toBe(0);
    });

    it("flags each missing required field", () => {
        expect(checkAssignment({})).toBe(ASSIGNMENT_FLAGS.MISSING_NAME | ASSIGNMENT_FLAGS.MISSING_CLASS | ASSIGNMENT_FLAGS.MISSING_DUE_DATE);
    });

    it("flags opening or start dates at or after the due date", () => {
        const dueDate = new Date("2026-01-02T00:00:00Z");

        expect(checkAssignment({ name: "Essay", class: "class-1", dueDate, openDate: dueDate })).toBe(ASSIGNMENT_FLAGS.OPEN_AFTER_DUE);
        expect(checkAssignment({ name: "Essay", class: "class-1", dueDate, startDate: dueDate })).toBe(ASSIGNMENT_FLAGS.START_AFTER_DUE);
    });

    it("combines flags when multiple assignment fields are invalid", () => {
        const dueDate = new Date("2026-01-02T00:00:00Z");

        expect(
            checkAssignment({
                name: "",
                class: "",
                dueDate,
                openDate: new Date(dueDate.getTime() + 1),
                startDate: new Date(dueDate.getTime() + 1)
            })
        ).toBe(ASSIGNMENT_FLAGS.MISSING_NAME | ASSIGNMENT_FLAGS.MISSING_CLASS | ASSIGNMENT_FLAGS.OPEN_AFTER_DUE | ASSIGNMENT_FLAGS.START_AFTER_DUE);
    });
});
