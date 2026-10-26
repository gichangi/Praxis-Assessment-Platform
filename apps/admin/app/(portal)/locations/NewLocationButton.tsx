"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { t } from "@/lib/utils";
import type { LocationRow } from "./page";

const NO_PARENT = "__root__";

export function NewLocationButton({ locations }: { locations: LocationRow[] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [parentId, setParentId] = useState<string>(NO_PARENT);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const sb = createClient();

  function reset() {
    setName("");
    setCode("");
    setParentId(NO_PARENT);
  }

  async function create() {
    if (!name.trim() || !code.trim()) return;
    setLoading(true);

    const parent = parentId !== NO_PARENT ? locations.find((l) => l.id === parentId) : null;
    const level = parent ? parent.level + 1 : 0;

    const { error } = await sb.from("locations").insert({
      parent_id: parent?.id ?? null,
      code: code.trim(),
      name: { en: name.trim() },
      level,
    });
    setLoading(false);
    if (error) {
      toast({ title: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Location created" });
    setOpen(false);
    reset();
    router.refresh();
  }

  const sortedLocations = [...locations].sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return t(a.name).localeCompare(t(b.name));
  });

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Add location
      </Button>
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Add location</DialogTitle>
          </DialogHeader>
          <form
            id="new-location"
            onSubmit={(e) => { e.preventDefault(); void create(); }}
            className="space-y-4"
          >
            <div>
              <label htmlFor="loc-parent" className="field-label">
                Parent location
              </label>
              <Select value={parentId} onValueChange={setParentId}>
                <SelectTrigger id="loc-parent">
                  <SelectValue placeholder="None (top-level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PARENT}>None (top-level)</SelectItem>
                  {sortedLocations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {"  ".repeat(loc.level)}{t(loc.name)} ({loc.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="loc-name" className="field-label">
                Name (English)
              </label>
              <Input
                id="loc-name"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!code)
                    setCode(
                      e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "_")
                        .replace(/[^a-z0-9_]/g, "")
                        .slice(0, 20)
                    );
                }}
              />
            </div>
            <div>
              <label htmlFor="loc-code" className="field-label">
                Code
              </label>
              <Input
                id="loc-code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="garowe"
              />
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); reset(); }}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="new-location"
              disabled={loading || !name.trim() || !code.trim()}
            >
              {loading ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
