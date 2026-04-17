export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-64 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-96 bg-gray-100 rounded mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-white border border-gray-200 rounded-lg" />
        ))}
      </div>
      <div className="h-48 bg-white border border-gray-200 rounded-lg" />
    </div>
  );
}
