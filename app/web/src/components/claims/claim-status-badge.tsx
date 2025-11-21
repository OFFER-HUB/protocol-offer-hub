/**
 * Badge component for claim status
 */

export function ClaimStatusBadge({ approved }: { approved: boolean }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}
    >
      {approved ? 'Approved' : 'Pending'}
    </span>
  );
}


