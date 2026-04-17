import Link from 'next/link';

export default function UserNotFound() {
  return (
    <div className="max-w-xl mx-auto mt-12 bg-white rounded-lg border border-gray-200 p-6 text-center">
      <h1 className="text-lg font-semibold text-[#0A1628]">User not found</h1>
      <p className="mt-2 text-sm text-gray-600">
        This user id does not exist or has been deactivated.
      </p>
      <Link
        href="/admin/users"
        className="mt-4 inline-block px-4 py-2 bg-[#0A1628] text-white text-sm font-semibold rounded hover:bg-[#C5933A] hover:text-[#0A1628] transition-colors"
      >
        Back to users
      </Link>
    </div>
  );
}
