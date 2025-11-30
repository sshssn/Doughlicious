"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { serverComms } from "../../../lib/servercomms"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { Loader2, Coins } from "lucide-react"
import { useToast } from "../../../hooks/use-toast"

type User = {
    id: string
    email: string
    role: string
    createdAt: string
}

export default function UsersAdminPage() {
    const { getToken, isLoaded, isSignedIn } = useAuth()
    const { toast } = useToast()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [creditingUserId, setCreditingUserId] = useState<string | null>(null)
    const [points, setPoints] = useState<string>("")
    const [reason, setReason] = useState<string>("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        async function fetchUsers() {
            if (!isSignedIn) return
            try {
                const token = await getToken()
                if (!token) return
                const res = await serverComms("admin/users", { headers: { Authorization: `Bearer ${token}` } })
                if (res.data) {
                    setUsers(res.data)
                }
            } catch (error) {
                console.error("Failed to fetch users", error)
            } finally {
                setLoading(false)
            }
        }
        if (isLoaded) {
            fetchUsers()
            // Set up polling every 10 seconds for real-time updates (users change less frequently)
            const interval = setInterval(() => {
                fetchUsers()
            }, 10000)
            return () => clearInterval(interval)
        }
    }, [isLoaded, isSignedIn, getToken])

    async function handleCreditPoints(userId: string) {
        if (!points || isNaN(Number(points)) || Number(points) === 0) {
            toast({
                title: "Invalid points",
                description: "Please enter a valid non-zero number of points",
                variant: "destructive"
            })
            return
        }

        setIsSubmitting(true)
        try {
            const token = await getToken()
            if (!token) {
                toast({
                    title: "Error",
                    description: "Authentication required",
                    variant: "destructive"
                })
                return
            }

            const res = await serverComms(`admin/users/${userId}/credit-points`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                data: {
                    points: Number(points),
                    reason: reason || undefined
                }
            })

            if (res.error) {
                toast({
                    title: "Error",
                    description: res.error,
                    variant: "destructive"
                })
            } else {
                toast({
                    title: "Success",
                    description: `Credited ${points} points. New balance: ${res.data?.newBalance || "N/A"}`,
                })
                setCreditingUserId(null)
                setPoints("")
                setReason("")
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to credit points",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isLoaded || loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
                <p className="text-muted-foreground">View all registered users</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead>ID</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground">{user.id}</TableCell>
                                        <TableCell>
                                            <Dialog open={creditingUserId === user.id} onOpenChange={(open) => {
                                                if (!open) {
                                                    setCreditingUserId(null)
                                                    setPoints("")
                                                    setReason("")
                                                } else {
                                                    setCreditingUserId(user.id)
                                                }
                                            }}>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        <Coins className="h-4 w-4 mr-1" />
                                                        Credit Points
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Credit Loyalty Points</DialogTitle>
                                                        <DialogDescription>
                                                            Manually credit loyalty points to {user.email}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="space-y-4 py-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="points">Points</Label>
                                                            <Input
                                                                id="points"
                                                                type="number"
                                                                placeholder="Enter points to credit"
                                                                value={points}
                                                                onChange={(e) => setPoints(e.target.value)}
                                                                disabled={isSubmitting}
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="reason">Reason (optional)</Label>
                                                            <Textarea
                                                                id="reason"
                                                                placeholder="Reason for crediting points (e.g., 'Compensation for failed order')"
                                                                value={reason}
                                                                onChange={(e) => setReason(e.target.value)}
                                                                disabled={isSubmitting}
                                                                rows={3}
                                                            />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                setCreditingUserId(null)
                                                                setPoints("")
                                                                setReason("")
                                                            }}
                                                            disabled={isSubmitting}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleCreditPoints(user.id)}
                                                            disabled={isSubmitting || !points || isNaN(Number(points)) || Number(points) === 0}
                                                        >
                                                            {isSubmitting ? (
                                                                <>
                                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                    Crediting...
                                                                </>
                                                            ) : (
                                                                "Credit Points"
                                                            )}
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
