import "./ResumeSelector.css";

export default function ResumeSelector({ resumes, selectedId, onSelect }) {
  return (
    <select
      value={selectedId || ""}
      onChange={(e) => onSelect(e.target.value)}
      className="resume-select"
      aria-label="Select a resume"
    >
      {!selectedId && (
        <option value="" disabled>
          -- Select a Resume --
        </option>
      )}
      {resumes.map((r) => {
        const id = r._id?.toString?.();
        if (!id) return null;

        const name = r.originalName || "Unnamed Resume";

        let rawDate;
        if (r.createdAt) {
          rawDate = new Date(r.createdAt);
        } else if (id.length === 24) {
          const timestampHex = id.substring(0, 8);
          const timestamp = parseInt(timestampHex, 16) * 1000;
          rawDate = new Date(timestamp);
        } else {
          rawDate = new Date();
        }

        const date = rawDate.toLocaleDateString();

        return (
          <option key={id} value={id}>
            {`${name} (${date})`}
          </option>
        );
      })}
    </select>
  );
}
