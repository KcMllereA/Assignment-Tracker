import useNow from "../../contexts/useNow";
import { formatRelativeTime } from "../../util/time";

export default function AssignmentCard({ assignment }) {
    const now = useNow();
    return (
        <li>
            {assignment.status} | {assignment.name} | {assignment.type} | Due {formatRelativeTime(assignment.dueDate - now)}
        </li>
    );
}
