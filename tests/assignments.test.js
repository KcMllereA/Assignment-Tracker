import { describe, expect, it } from "vitest";
import { ASSIGNMENT_FLAGS, DUE_DATE_COLORS, SECTIONS, STATUSES, checkAssignment, getDueDateMix, getSection, getStartingStatus, groupSections } from "../src/logic/assignments";

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
            [SECTIONS.OVERDUE]: [overdueEarlier, overdueLater],
            [SECTIONS.ACTIVE]: [active],
            [SECTIONS.NOT_OPEN]: [upcoming]
        });
    });

    it("returns no groups for an empty assignment collection", () => {
        expect(groupSections({}, new Date())).toEqual({});
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
