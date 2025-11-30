import { Skeleton } from "../../components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "../../components/ui/card"

export default function MenuLoading() {
  return (
    <main className="container mx-auto max-w-screen-2xl px-4 py-10 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden h-full flex flex-col">
            <Skeleton className="aspect-square w-full" />
            <CardHeader className="p-4">
              <div className="flex justify-between items-start gap-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-16" />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-1">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  )
}

