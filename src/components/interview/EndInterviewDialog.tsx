import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface EndInterviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function EndInterviewDialog({ open, onOpenChange, onConfirm }: EndInterviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">End Interview Early?</DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            Are you sure you want to end the interview? Your progress will be saved, but you won`&apos;`t be able to continue
            from where you left off.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="px-6">
            Continue Interview
          </Button>
          <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 px-6">
            End Interview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
