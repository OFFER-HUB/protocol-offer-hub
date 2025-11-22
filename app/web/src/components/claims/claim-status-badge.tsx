/**
 * Badge component for claim status
 * Claims are always Approved when created
 */

export function ClaimStatusBadge({ approved }: { approved: boolean }) {
  return (
    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
      Approved
    </span>
  );
}


