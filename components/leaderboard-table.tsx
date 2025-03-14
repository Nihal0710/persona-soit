import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from "date-fns"
import { useEffect, useState } from "react"

interface LeaderboardTableProps {
  leaderboard: {
    userId: string
    displayName: string
    photoUrl: string
    score: number
    completedAt: string
    timeSpent: number
  }[]
}

export default function LeaderboardTable({ leaderboard }: LeaderboardTableProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-8 text-white/70">
        No entries in the leaderboard yet. Be the first to complete a quiz!
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-indigo-900/30">
          <TableHead className="text-white">Player</TableHead>
          <TableHead className="text-right text-white">Score</TableHead>
          <TableHead className="text-right text-white hidden md:table-cell">Time</TableHead>
          <TableHead className="text-right text-white hidden md:table-cell">Completed</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaderboard.map((entry, index) => (
          <TableRow key={index} className="border-indigo-900/30">
            <TableCell className="font-medium text-white">{entry.displayName}</TableCell>
            <TableCell className="text-right text-white">{entry.score}%</TableCell>
            <TableCell className="text-right text-white/70 hidden md:table-cell">
              {Math.floor(entry.timeSpent / 60)}m {entry.timeSpent % 60}s
            </TableCell>
            <TableCell className="text-right text-white/70 hidden md:table-cell">
              {mounted ? formatDistanceToNow(new Date(entry.completedAt), { addSuffix: true }) : ''}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

