import { useState, FormEvent } from "react";

interface TeamMember {
  name: string;
  title: string;
}

const defaultMembers: TeamMember[] = [
  { name: "Ursula Searle", title: "Managing Director" },
  { name: "Ash Dorman", title: "Managing Director" },
  { name: "Shamita Siva", title: "Creative Director" },
  { name: "Alan McCarthy", title: "Impact Direct" },
  { name: "Mish Rep", title: "Operations Officer" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function stringToHslColor(str: string, s: number, l: number) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

const Avatar = ({ name }: { name: string }) => {
  const initials = getInitials(name);
  const bgColor = stringToHslColor(name, 70, 40);
  return (
    <div
      className="flex items-center justify-center w-12 h-12 rounded-full text-white font-semibold text-lg"
      style={{ backgroundColor: bgColor }}
    >
      {initials}
    </div>
  );
};

export default function TeamTabs() {
  const [members, setMembers] = useState<TeamMember[]>(defaultMembers);
  const [selected, setSelected] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formTitle, setFormTitle] = useState("");

  const addMember = (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formTitle.trim()) return;
    setMembers([...members, { name: formName.trim(), title: formTitle.trim() }]);
    setFormName("");
    setFormTitle("");
    setShowForm(false);
    setSelected(members.length); // select new member
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Our Team</h2>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {members.map((member, idx) => (
          <button
            key={member.name + idx}
            onClick={() => setSelected(idx)}
            className={`px-4 py-2 rounded-full border transition-colors text-sm md:text-base ${
              idx === selected
                ? "bg-gray-800 text-white border-gray-800"
                : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {member.name.split(" ")[0]} {/* first name */}
          </button>
        ))}
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 rounded-full border border-dashed border-gray-400 text-gray-500 hover:bg-gray-100"
          aria-label="Add team member"
        >
          + Add
        </button>
      </div>

      {/* Selected member card */}
      {members[selected] && (
        <div className="flex flex-col items-center gap-4 bg-white shadow-md rounded-lg p-6">
          <Avatar name={members[selected].name} />
          <div className="text-center">
            <h3 className="text-xl font-semibold">{members[selected].name}</h3>
            <p className="text-gray-600">{members[selected].title}</p>
          </div>
        </div>
      )}

      {/* Add member form */}
      {showForm && (
        <form
          onSubmit={addMember}
          className="mt-8 bg-gray-50 p-4 rounded-lg shadow-inner"
        >
          <h4 className="font-semibold mb-4">Add New Team Member</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Full Name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="border rounded px-3 py-2 w-full"
              required
            />
            <input
              type="text"
              placeholder="Title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="border rounded px-3 py-2 w-full"
              required
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="border px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
