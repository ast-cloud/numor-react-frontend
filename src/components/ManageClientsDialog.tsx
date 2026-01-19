import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Users, User, Mail, Phone, MapPin, Plus, Pencil, Save, Trash2 } from "lucide-react";

export interface Client {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
}

interface ManageClientsDialogProps {
  trigger?: React.ReactNode;
}

const ManageClientsDialog = ({ trigger }: ManageClientsDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  const handleAddClient = () => {
    const newClient: Client = {
      id: crypto.randomUUID(),
      name: "",
      address: "",
      email: "",
      phone: "",
    };
    setClients([...clients, newClient]);
    setEditingClientId(newClient.id);
  };

  const handleUpdateClient = (id: string, field: keyof Client, value: string) => {
    setClients(clients.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSaveClient = (id: string) => {
    const client = clients.find(c => c.id === id);
    if (client && !client.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a client name.",
        variant: "destructive",
      });
      return;
    }
    setEditingClientId(null);
    toast({
      title: "Client saved",
      description: "Client information has been saved.",
    });
  };

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
    toast({
      title: "Client removed",
      description: "Client has been removed from your list.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon">
            <Users className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Manage Clients</span>
            <Button variant="outline" size="sm" className="h-7 text-xs px-2.5" onClick={handleAddClient}>
              <Plus className="w-3 h-3 mr-1.5" />
              Add Client
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {clients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No clients added yet</p>
              <p className="text-sm">Click "Add Client" to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clients.map((client) => (
                <div key={client.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      {client.name || "New Client"}
                    </h4>
                    <div className="flex gap-2">
                      {editingClientId === client.id ? (
                        <Button size="sm" className="h-7 text-xs" onClick={() => handleSaveClient(client.id)}>
                          <Save className="w-3 h-3 mr-1.5" />
                          Save
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setEditingClientId(client.id)}>
                          <Pencil className="w-3 h-3 mr-1.5" />
                          Edit
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteClient(client.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">
                        <User className="w-3 h-3 text-muted-foreground" />
                        Name
                      </Label>
                      {editingClientId === client.id ? (
                        <Input
                          value={client.name}
                          onChange={(e) => handleUpdateClient(client.id, "name", e.target.value)}
                          placeholder="Client name"
                          className="h-8 text-sm"
                        />
                      ) : (
                        <p className="text-sm py-1.5 px-3 bg-muted/50 rounded-md">
                          {client.name || "Not set"}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        Email
                      </Label>
                      {editingClientId === client.id ? (
                        <Input
                          type="email"
                          value={client.email}
                          onChange={(e) => handleUpdateClient(client.id, "email", e.target.value)}
                          placeholder="Client email"
                          className="h-8 text-sm"
                        />
                      ) : (
                        <p className="text-sm py-1.5 px-3 bg-muted/50 rounded-md">
                          {client.email || "Not set"}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">
                        <Phone className="w-3 h-3 text-muted-foreground" />
                        Phone
                      </Label>
                      {editingClientId === client.id ? (
                        <Input
                          type="tel"
                          value={client.phone}
                          onChange={(e) => handleUpdateClient(client.id, "phone", e.target.value)}
                          placeholder="Client phone"
                          className="h-8 text-sm"
                        />
                      ) : (
                        <p className="text-sm py-1.5 px-3 bg-muted/50 rounded-md">
                          {client.phone || "Not set"}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-xs">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        Address
                      </Label>
                      {editingClientId === client.id ? (
                        <Input
                          value={client.address}
                          onChange={(e) => handleUpdateClient(client.id, "address", e.target.value)}
                          placeholder="Client address"
                          className="h-8 text-sm"
                        />
                      ) : (
                        <p className="text-sm py-1.5 px-3 bg-muted/50 rounded-md">
                          {client.address || "Not set"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageClientsDialog;
