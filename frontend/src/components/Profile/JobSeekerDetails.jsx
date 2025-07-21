const JobSeekerDetails = ({ bio, setBio }) => (
  <div className="mb-6">
    <h3 className="text-xl font-semibold mb-2">Job Seeker Details</h3>
    <label className="block mb-1 font-semibold" htmlFor="bio">
      Bio:
    </label>
    <textarea
      id="bio"
      value={bio}
      onChange={(e) => setBio(e.target.value)}
      rows={4}
      className="w-full border border-gray-300 rounded p-2"
      placeholder="Write something about yourself..."
    />
  </div>
);

export default JobSeekerDetails;
