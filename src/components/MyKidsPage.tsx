import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Pencil } from "lucide-react";
import type { Child } from "@/pages/Dashboard";

type MyKidsPageProps = {
  onChildAdded: () => void;
};

export function MyKidsPage({ onChildAdded }: MyKidsPageProps) {
  const [children, setChildren] = useState<Child[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [newChild, setNewChild] = useState({ name: "", age: "" });
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [editFormData, setEditFormData] = useState({ name: "", age: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("children")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching children:", error);
    } else {
      setChildren(data || []);
    }
  };

  const addChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("children")
      .insert([
        {
          name: newChild.name,
          age: parseInt(newChild.age),
          user_id: user.id,
        },
      ])
      .select();

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      if (data) setChildren([...children, data[0]]);
      setNewChild({ name: "", age: "" });
      setShowAddForm(false);
      onChildAdded?.();
      toast({
        title: "Success",
        description: "Child profile created successfully!",
      });
    }
    setLoading(false);
  };

  const deleteChild = async (childId: string) => {
    if (!window.confirm("Are you sure you want to delete this child profile? This action cannot be undone.")) {
      return;
    }

    const { error } = await supabase.from("children").delete().eq("id", childId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setChildren(children.filter((child) => child.id !== childId));
      toast({
        title: "Success",
        description: "Child profile deleted successfully.",
      });
    }
  };

  const openEditForm = (child: Child) => {
    setEditingChild(child);
    setEditFormData({ name: child.name, age: child.age.toString() });
    setShowEditForm(true);
  };

  const updateChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChild) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("children")
      .update({
        name: editFormData.name,
        age: parseInt(editFormData.age),
      })
      .eq("id", editingChild.id)
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setChildren(children.map((child) => (child.id === editingChild.id ? data : child)));
      setShowEditForm(false);
      setEditingChild(null);
      setEditFormData({ name: "", age: "" });
      toast({
        title: "Success",
        description: "Child profile updated successfully!",
      });
    }

    setLoading(false);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Kids</h1>
          <Button onClick={() => setShowAddForm(true)} className="shadow-soft">
            Add Child
          </Button>
        </div>

        {children.length === 0 && !showAddForm ? (
          <Card className="shadow-card border-border">
            <CardContent className="text-center py-16">
              <div className="text-6xl mb-6">👶</div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">No children added yet</h3>
              <p className="text-muted-foreground mb-8">
                Start by adding your first child to track their progress
              </p>
              <Button onClick={() => setShowAddForm(true)} size="lg" className="shadow-soft">
                Add Your First Child
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child) => (
              <Card key={child.id} className="shadow-card border-border hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{child.name}</h3>
                      <p className="text-muted-foreground">Age: {child.age} years</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditForm(child)}
                        className="text-primary hover:text-primary hover:bg-primary/10"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteChild(child.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Child Dialog */}
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Child</DialogTitle>
            </DialogHeader>
            <form onSubmit={addChild} className="space-y-4">
              <div>
                <Label htmlFor="name">Child's Name</Label>
                <Input
                  id="name"
                  required
                  className="mt-1"
                  value={newChild.name}
                  onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                  placeholder="Enter child's name"
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  required
                  min="0"
                  max="18"
                  className="mt-1"
                  value={newChild.age}
                  onChange={(e) => setNewChild({ ...newChild, age: e.target.value })}
                  placeholder="Enter age"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Child
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Child Dialog */}
        <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Child Profile</DialogTitle>
            </DialogHeader>
            <form onSubmit={updateChild} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Child's Name</Label>
                <Input
                  id="edit-name"
                  required
                  className="mt-1"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="Enter child's name"
                />
              </div>
              <div>
                <Label htmlFor="edit-age">Age</Label>
                <Input
                  id="edit-age"
                  type="number"
                  required
                  min="0"
                  max="18"
                  className="mt-1"
                  value={editFormData.age}
                  onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                  placeholder="Enter age"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Child
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingChild(null);
                    setEditFormData({ name: "", age: "" });
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}