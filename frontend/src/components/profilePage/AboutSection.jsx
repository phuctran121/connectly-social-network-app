import { useState } from "react";
import toast from "react-hot-toast";

const AboutSection = ({ userData, isOwnProfile, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [about, setAbout] = useState(userData.about || "");

  const handleSave = () => {
    if (about === userData.about) {
      toast.error("No changes made to the about section.");
      return;
    }

    setIsEditing(false);
    onSave({ about });
  };
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-black">About</h2>
      {isOwnProfile && (
        <>
          {isEditing ? (
            <>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full p-2 border rounded text-black"
                rows="4"
              />
              <button
                onClick={handleSave}
                className="mt-2 bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark 
								transition duration-300"
              >
                Save
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
            <>
              <p className="text-black">{userData.about}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-2 text-primary hover:text-primary-dark transition duration-300"
              >
                Edit
              </button>
            </>
          )}
        </>
      )}
      {!isOwnProfile && (
        <p className="text-black">
          {userData.about || "No about information available."}
        </p>
      )}
    </div>
  );
};
export default AboutSection;
