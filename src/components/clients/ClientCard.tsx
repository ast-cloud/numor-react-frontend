import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { User, Mail, Phone, MapPin, Pencil, Save, Trash2, ChevronDown, X } from "lucide-react";
import { INDIAN_STATES } from "@/lib/constants";
import type { Client } from "@/components/ClientsView";

interface ClientCardProps {
  client: Client;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onUpdate: (field: keyof Client, value: string) => void;
}

const ClientCard = ({ client, isEditing, onEdit, onSave, onCancel, onDelete, onUpdate }: ClientCardProps) => {
  const [isOpen, setIsOpen] = useState(isEditing);

  // Auto-expand when editing starts
  if (isEditing && !isOpen) {
    setIsOpen(true);
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-lg overflow-hidden transition-shadow duration-300 hover:shadow-sm">
        {/* Collapsed header - always visible */}
        <div className="flex items-center justify-between p-4">
          <CollapsibleTrigger className="flex items-center gap-3 flex-1 text-left group">
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            <div className="min-w-0">
              <h4 className="font-medium truncate">{client.name || "New Client"}</h4>
              <p className="text-sm text-muted-foreground truncate">
                {client.email || "No email"}
              </p>
            </div>
          </CollapsibleTrigger>
          <div className="flex gap-2 shrink-0 ml-3">
            {isEditing ? (
              <>
                <Button size="sm" className="h-7 text-xs" onClick={onSave}>
                  <Save className="w-3 h-3 mr-1.5" />
                  Save
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onCancel}>
                  <X className="w-3 h-3 mr-1.5" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={onEdit}>
                <Pencil className="w-3 h-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={onDelete}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Expandable content */}
        <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
          <div className="px-4 pb-4 pt-0 space-y-4 border-t">
            <div className="grid gap-4 md:grid-cols-2 pt-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs">
                  <User className="w-3 h-3 text-muted-foreground" />
                  Name
                </Label>
                {isEditing ? (
                  <Input
                    value={client.name}
                    onChange={(e) => onUpdate("name", e.target.value)}
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
                {isEditing ? (
                  <Input
                    type="email"
                    value={client.email}
                    onChange={(e) => onUpdate("email", e.target.value)}
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
                {isEditing ? (
                  <Input
                    type="tel"
                    value={client.phone}
                    onChange={(e) => onUpdate("phone", e.target.value)}
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
                    {isEditing ? (
                      <Input
                        value={client.streetAddress}
                        onChange={(e) => onUpdate("streetAddress", e.target.value)}
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
                    {isEditing ? (
                      <Input
                        value={client.city}
                        onChange={(e) => onUpdate("city", e.target.value)}
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
                    {isEditing ? (
                      client.country === "India" ? (
                        <Select
                          value={client.state}
                          onValueChange={(value) => onUpdate("state", value)}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            {INDIAN_STATES.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={client.state}
                          onChange={(e) => onUpdate("state", e.target.value)}
                          placeholder="e.g. Dubai"
                          className="h-8 text-sm"
                        />
                      )
                    ) : (
                      <p className="text-sm py-1.5 px-3 bg-muted/50 rounded-md">
                        {client.state || "Not set"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">ZIP / Postal Code</Label>
                    {isEditing ? (
                      <Input
                        value={client.zipCode}
                        onChange={(e) => onUpdate("zipCode", e.target.value)}
                        placeholder="e.g. 00000"
                        className="h-8 text-sm"
                      />
                    ) : (
                      <p className="text-sm py-1.5 px-3 bg-muted/50 rounded-md">
                        {client.zipCode || "Not set"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Country</Label>
                    {isEditing ? (
                      <Select
                        value={client.country}
                        onValueChange={(value) => onUpdate("country", value)}
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
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default ClientCard;
