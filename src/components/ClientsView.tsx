import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, User, Mail, Phone, MapPin, Plus, Pencil, Save, Trash2, ArrowLeft } from "lucide-react";

export interface Client {
  id: string;
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  email: string;
  phone: string;
}

interface ClientsViewProps {
  onBack: () => void;
}

const ClientsView = ({ onBack }: ClientsViewProps) => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  const handleAddClient = () => {
    const newClient: Client = {
      id: crypto.randomUUID(),
      name: "",
      streetAddress: "",
      city: "",
      state: "",
      zip: "",
      country: "",
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
        {clients.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
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
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setEditingClientId(client.id)}>
                        <Pencil className="w-3 h-3" />
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

                  {/* Client Address Subgroup */}
                  <div className="md:col-span-2 space-y-4 p-4 border border-border rounded-lg bg-muted/20">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      Client Address
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-xs">Street Address</Label>
                        {editingClientId === client.id ? (
                          <Input
                            value={client.streetAddress}
                            onChange={(e) => handleUpdateClient(client.id, "streetAddress", e.target.value)}
                            placeholder="e.g. 123 Business Street, Suite 100"
                            className="h-8 text-sm"
                          />
                        ) : (
                          <p className="text-sm py-1.5 px-3 bg-muted/50 rounded-md">
                            {client.streetAddress || "Not set"}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">City</Label>
                        {editingClientId === client.id ? (
                          <Input
                            value={client.city}
                            onChange={(e) => handleUpdateClient(client.id, "city", e.target.value)}
                            placeholder="e.g. Dubai"
                            className="h-8 text-sm"
                          />
                        ) : (
                          <p className="text-sm py-1.5 px-3 bg-muted/50 rounded-md">
                            {client.city || "Not set"}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">State / Province</Label>
                        {editingClientId === client.id ? (
                          <Input
                            value={client.state}
                            onChange={(e) => handleUpdateClient(client.id, "state", e.target.value)}
                            placeholder="e.g. Dubai"
                            className="h-8 text-sm"
                          />
                        ) : (
                          <p className="text-sm py-1.5 px-3 bg-muted/50 rounded-md">
                            {client.state || "Not set"}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">ZIP / Postal Code</Label>
                        {editingClientId === client.id ? (
                          <Input
                            value={client.zip}
                            onChange={(e) => handleUpdateClient(client.id, "zip", e.target.value)}
                            placeholder="e.g. 00000"
                            className="h-8 text-sm"
                          />
                        ) : (
                          <p className="text-sm py-1.5 px-3 bg-muted/50 rounded-md">
                            {client.zip || "Not set"}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Country</Label>
                        {editingClientId === client.id ? (
                          <Select
                            value={client.country}
                            onValueChange={(value) => handleUpdateClient(client.id, "country", value)}
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="India">India</SelectItem>
                              <SelectItem value="UAE">UAE</SelectItem>
                              <SelectItem value="US">United States</SelectItem>
                              <SelectItem value="UK">United Kingdom</SelectItem>
                              <SelectItem value="Austria">Austria</SelectItem>
                              <SelectItem value="Belgium">Belgium</SelectItem>
                              <SelectItem value="Bulgaria">Bulgaria</SelectItem>
                              <SelectItem value="Croatia">Croatia</SelectItem>
                              <SelectItem value="Cyprus">Cyprus</SelectItem>
                              <SelectItem value="Czech Republic">Czech Republic</SelectItem>
                              <SelectItem value="Denmark">Denmark</SelectItem>
                              <SelectItem value="Estonia">Estonia</SelectItem>
                              <SelectItem value="Finland">Finland</SelectItem>
                              <SelectItem value="France">France</SelectItem>
                              <SelectItem value="Germany">Germany</SelectItem>
                              <SelectItem value="Greece">Greece</SelectItem>
                              <SelectItem value="Hungary">Hungary</SelectItem>
                              <SelectItem value="Ireland">Ireland</SelectItem>
                              <SelectItem value="Italy">Italy</SelectItem>
                              <SelectItem value="Latvia">Latvia</SelectItem>
                              <SelectItem value="Lithuania">Lithuania</SelectItem>
                              <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                              <SelectItem value="Malta">Malta</SelectItem>
                              <SelectItem value="Netherlands">Netherlands</SelectItem>
                              <SelectItem value="Poland">Poland</SelectItem>
                              <SelectItem value="Portugal">Portugal</SelectItem>
                              <SelectItem value="Romania">Romania</SelectItem>
                              <SelectItem value="Slovakia">Slovakia</SelectItem>
                              <SelectItem value="Slovenia">Slovenia</SelectItem>
                              <SelectItem value="Spain">Spain</SelectItem>
                              <SelectItem value="Sweden">Sweden</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm py-1.5 px-3 bg-muted/50 rounded-md">
                            {client.country || "Not set"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientsView;
