const ProfileHeader = ({ name, email, role, profilePictureUrl }) => (
  <div className="mb-6 flex items-center space-x-4">
    {profilePictureUrl && (
      <img
        src={profilePictureUrl}
        alt="Profile"
        className="w-20 h-20 rounded-full object-cover"
      />
    )}
    <div>
      <p>
        <strong>Name:</strong> {name}
      </p>
      <p>
        <strong>Email:</strong> {email}
      </p>
      <p>
        <strong>Role:</strong> {role}
      </p>
    </div>
  </div>
);

export default ProfileHeader;
