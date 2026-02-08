import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, ArrowLeft, Loader2 } from "lucide-react";
import { fetchClients, updateClient, type ClientData } from "@/lib/api/clients";
import ClientCard from "@/components/clients/ClientCard";

export interface Client {
  id: string;
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  email: string;
  phone: string;
}

interface ClientsViewProps {
  onBack: () => void;
}

const mapClientData = (c: ClientData): Client => ({
  id: c.id,
  name: c.name || "",
  streetAddress: c.streetAddress || "",
  city: c.city || "",
  state: c.state || "",
  zipCode: c.zipCode || "",
  country: c.country || "",
  email: c.email || "",
  phone: c.phone || "",
});

const ClientsView = ({ onBack }: ClientsViewProps) => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const backupRef = useRef<Client | null>(null);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await fetchClients();
        setClients(data.map(mapClientData));
      } catch (err) {
        toast({
          title: "Error loading clients",
          description: "Could not fetch clients from the server.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadClients();
  }, [toast]);

  const handleAddClient = () => {
    const newClient: Client = {
      id: crypto.randomUUID(),
      name: "",
      streetAddress: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
      email: "",
      phone: "",
    };
    setClients([...clients, newClient]);
    backupRef.current = { ...newClient };
    setEditingClientId(newClient.id);
  };

  const handleEditClient = (id: string) => {
    const client = clients.find(c => c.id === id);
    if (client) {
      backupRef.current = { ...client };
    }
    setEditingClientId(id);
  };

  const handleUpdateClient = (id: string, field: keyof Client, value: string) => {
    setClients(clients.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSaveClient = async (id: string) => {
    const client = clients.find(c => c.id === id);
    if (client && !client.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a client name.",
        variant: "destructive",
      });
      return;
    }
    if (!client) return;

    setIsSaving(true);
    try {
      await updateClient(id, {
        name: client.name || null,
        email: client.email || null,
        phone: client.phone || null,
        streetAddress: client.streetAddress || null,
        city: client.city || null,
        state: client.state || null,
        zipCode: client.zipCode || null,
        country: client.country || null,
      });
      setEditingClientId(null);
      backupRef.current = null;
      toast({
        title: "Client saved",
        description: "Client information has been updated.",
      });
    } catch {
      toast({
        title: "Save failed",
        description: "Could not update client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = (id: string) => {
    if (backupRef.current) {
      // If it was a new unsaved client (no name in backup), remove it
      if (!backupRef.current.name.trim()) {
        setClients(clients.filter(c => c.id !== id));
      } else {
        // Restore original values
        setClients(clients.map(c => c.id === id ? { ...backupRef.current! } : c));
      }
    }
    backupRef.current = null;
    setEditingClientId(null);
  };

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
    toast({
      title: "Client removed",
      description: "Client has been removed from your list.",
    });
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your client information for invoices.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleAddClient}>
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border p-6">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin opacity-50" />
            <p>Loading clients...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No clients added yet</p>
            <p className="text-sm">Click "Add Client" to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {clients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                isEditing={editingClientId === client.id}
                onEdit={() => handleEditClient(client.id)}
                onSave={() => handleSaveClient(client.id)}
                onCancel={() => handleCancelEdit(client.id)}
                onDelete={() => handleDeleteClient(client.id)}
                onUpdate={(field, value) => handleUpdateClient(client.id, field, value)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientsView;
