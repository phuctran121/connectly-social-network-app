import { X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const SkillsSection = ({ userData, isOwnProfile, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [skills, setSkills] = useState(userData.skills || []);
  const [newSkill, setNewSkill] = useState("");

  const handleAddSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill("");
    }
  };

  const handleDeleteSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSave = () => {
    const isUnchanged =
      JSON.stringify(skills) === JSON.stringify(userData.skills || []);

    if (isUnchanged) {
      toast.error("No changes made to the skills section.");
      return;
    }
    onSave({ skills });
    setIsEditing(false);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-black">Skills</h2>
      <div className="flex flex-wrap">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm mr-2 mb-2 flex items-center"
          >
            {skill}
            {isEditing && (
              <button
                onClick={() => handleDeleteSkill(skill)}
                className="ml-2 text-red-500"
              >
                <X size={14} />
              </button>
            )}
          </span>
        ))}
      </div>

      {isEditing && (
        <div className="mt-4 flex">
          <input
            type="text"
            placeholder="New Skill"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            className="flex-grow p-2 border rounded-l bg-white text-black"
          />
          <button
            onClick={handleAddSkill}
            className="bg-primary text-white py-2 px-4 rounded-r hover:bg-primary-dark transition duration-300"
          >
            Add Skill
          </button>
        </div>
      )}

      {isOwnProfile && (
        <>
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="mt-4 bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition duration-300"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="ml-4 mt-2 bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500
								transition duration-300"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 text-primary hover:text-primary-dark transition duration-300"
            >
              Edit Skills
            </button>
          )}
        </>
      )}
    </div>
  );
};
export default SkillsSection;
