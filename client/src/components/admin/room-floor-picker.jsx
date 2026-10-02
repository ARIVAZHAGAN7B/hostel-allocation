import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRooms } from "@/hooks/use-hostel-api";
import { BedDouble, Check, Layers, ShieldCheck, Users } from "lucide-react";

export function RoomFloorPickerModal({
  open,
  onOpenChange,
  hostelName = "Sapphire Block",
  applicantName = "Student",
  regNo = "",
  roomType = "Non-AC",
  sharing = 2,
  onConfirmAllotment,
  isSubmitting = false,
}) {
  const { data: rawRooms = [], isLoading } = useRooms({ hostelName });

  const [activeFloor, setActiveFloor] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState("");

  const rooms = Array.isArray(rawRooms) ? rawRooms : [];

  // Group rooms by floor
  const roomsByFloor = useMemo(() => {
    const grouped = {};
    rooms.forEach((r) => {
      const f = r.floor !== undefined ? r.floor : 0;
      if (!grouped[f]) grouped[f] = [];
      grouped[f].push(r);
    });
    return grouped;
  }, [rooms]);

  const availableFloors = useMemo(() => {
    const keys = Object.keys(roomsByFloor).map(Number).sort((a, b) => a - b);
    return keys.length > 0 ? keys : [0, 1, 2, 3, 4];
  }, [roomsByFloor]);

  const currentFloorRooms = roomsByFloor[activeFloor] || [];

  const floorStats = useMemo(() => {
    const total = currentFloorRooms.length;
    const available = currentFloorRooms.filter((r) => r.occupied < r.capacity).length;
    const empty = currentFloorRooms.filter((r) => r.occupied === 0).length;
    return { total, available, empty };
  }, [currentFloorRooms]);

  const handleSelectRoom = (roomNum, isFull) => {
    if (isFull) return;
    setSelectedRoom(roomNum);
  };

  const handleConfirm = () => {
    if (!selectedRoom) return;
    onConfirmAllotment(selectedRoom);
    setSelectedRoom("");
  };

  const getFloorName = (f) => {
    if (f === 0) return "Ground Floor";
    if (f === 1) return "1st Floor";
    if (f === 2) return "2nd Floor";
    if (f === 3) return "3rd Floor";
    return `${f}th Floor`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-6 overflow-hidden sm:rounded-2xl">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              <Layers className="size-5 text-primary" /> Floor-by-Floor Room Inspector
            </DialogTitle>
            <Badge variant="outline" className="text-xs px-3 py-1 font-semibold border-primary/30 text-primary">
              {hostelName}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Manually inspect room occupancy across floors and select an available room for <strong className="text-foreground">{applicantName}</strong> ({regNo || "Applicant"}).
          </DialogDescription>
        </DialogHeader>

        {/* Floor Selection Bar */}
        <div className="flex items-center gap-2 overflow-x-auto py-2 border-b">
          <span className="text-xs font-bold text-muted-foreground mr-1 flex items-center gap-1">
            <Layers className="size-3.5" /> Floors:
          </span>
          {availableFloors.map((f) => {
            const count = (roomsByFloor[f] || []).filter((r) => r.occupied < r.capacity).length;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setActiveFloor(f)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
                  activeFloor === f
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                <span>{getFloorName(f)}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeFloor === f ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-foreground"}`}>
                  {count} avail
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Floor Banner */}
        <div className="flex items-center justify-between bg-muted/30 px-4 py-2 rounded-xl text-xs border my-2">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <BedDouble className="size-4 text-primary" />
            {getFloorName(activeFloor)} Rooms Overview
          </span>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span>Total Rooms: <strong className="text-foreground">{floorStats.total || currentFloorRooms.length}</strong></span>
            <span>Empty: <strong className="text-emerald-600 dark:text-emerald-400">{floorStats.empty}</strong></span>
            <span>Available: <strong className="text-blue-600 dark:text-blue-400">{floorStats.available}</strong></span>
          </div>
        </div>

        {/* Floor Rooms Grid */}
        <div className="flex-1 overflow-y-auto pr-1 py-2 min-h-[320px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              Loading floor room layout...
            </div>
          ) : currentFloorRooms.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {currentFloorRooms.map((room) => {
                const isFull = room.occupied >= room.capacity;
                const isEmpty = room.occupied === 0;
                const isSelected = selectedRoom === room.number;

                return (
                  <div
                    key={room.id || room.number}
                    onClick={() => handleSelectRoom(room.number, isFull)}
                    className={`relative p-3.5 rounded-xl border-2 transition-all cursor-pointer select-none ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/40 scale-[1.02]"
                        : isFull
                        ? "border-muted bg-muted/40 opacity-60 cursor-not-allowed"
                        : isEmpty
                        ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500 hover:bg-emerald-500/10"
                        : "border-amber-500/40 bg-amber-500/5 hover:border-amber-500 hover:bg-amber-500/10"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground size-5 rounded-full flex items-center justify-center">
                        <Check className="size-3 stroke-[3]" />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <p className="text-base font-bold text-foreground">Room {room.number}</p>
                      <Badge
                        variant={isFull ? "outline" : isEmpty ? "default" : "secondary"}
                        className={`text-[10px] px-1.5 py-0.5 ${
                          isFull
                            ? "border-red-500/40 text-red-600 bg-red-500/10"
                            : isEmpty
                            ? "bg-emerald-600 text-white"
                            : "bg-amber-500 text-white"
                        }`}
                      >
                        {isFull ? "FULL" : isEmpty ? "EMPTY" : `${room.capacity - room.occupied} SPOT LEFT`}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1">
                      {room.type} · {room.capacity} Sharing
                    </p>

                    <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-border/50">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Users className="size-3" /> Occupancy:
                      </span>
                      <span className="font-bold text-foreground">
                        {room.occupied} / {room.capacity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BedDouble className="size-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-semibold text-muted-foreground">No room records configured for {getFloorName(activeFloor)}.</p>
            </div>
          )}
        </div>

        {/* Modal Footer & Confirmation */}
        <DialogFooter className="border-t pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Chosen Allotment:</span>
            {selectedRoom ? (
              <Badge variant="default" className="text-xs px-2.5 py-1 bg-primary font-bold">
                Room {selectedRoom} ({hostelName})
              </Badge>
            ) : (
              <span className="text-muted-foreground italic">Click any available room above to select</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="hero"
              size="sm"
              disabled={!selectedRoom || isSubmitting}
              onClick={handleConfirm}
              className="px-5 font-bold"
            >
              {isSubmitting ? "Allotting..." : selectedRoom ? `Confirm & Allot Room ${selectedRoom}` : "Select a Room First"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
