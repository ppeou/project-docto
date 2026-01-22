import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSpecialties } from '@/hooks/useSpecialties';
import { X, Plus, Phone, Mail, Globe, MapPin } from 'lucide-react';

const PHONE_TYPES = [
  { value: 1, label: 'Mobile' },
  { value: 2, label: 'Home' },
  { value: 3, label: 'Work' },
  { value: 4, label: 'Fax' },
  { value: 5, label: 'Other' },
];

const EMAIL_TYPES = [
  { value: 1, label: 'Personal' },
  { value: 2, label: 'Work' },
  { value: 3, label: 'Other' },
];

const WEBSITE_TYPES = [
  { value: 1, label: 'Personal' },
  { value: 2, label: 'Work' },
  { value: 3, label: 'Blog' },
  { value: 4, label: 'Portfolio' },
  { value: 5, label: 'Other' },
];

const ADDRESS_TYPES = [
  { value: 1, label: 'Home' },
  { value: 2, label: 'Work' },
  { value: 3, label: 'Other' },
  { value: 4, label: 'Mailing' },
  { value: 5, label: 'Billing' },
];

const MAP_TYPES = [
  'Google Maps',
  'Apple Maps',
  'Waze',
  'Bing Maps',
  'OpenStreetMap',
  'Other',
];

const PATIENT_RELATIONS = ['Self', 'Mother', 'Father', 'Spouse', 'Child', 'Sibling', 'Other'];

export function ContactForm({ 
  formData, 
  setFormData, 
  type = 'patient', // 'patient' or 'doctor'
  onSubmit 
}) {
  const { specialties, loading: specialtiesLoading } = useSpecialties();
  
  // Parse name into first and last name
  const nameParts = (formData.name || '').trim().split(/\s+/);
  const [firstName, setFirstName] = useState(nameParts[0] || '');
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') || '');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  
  // Convert specialty string to array for tags, or use existing array
  const specialtyArray = Array.isArray(formData.specialties) 
    ? formData.specialties 
    : (formData.specialty ? [formData.specialty] : []);

  const updateName = (first, last) => {
    const fullName = [first, last].filter(Boolean).join(' ').trim();
    setFormData({ ...formData, name: fullName });
  };

  const handleFirstNameChange = (value) => {
    setFirstName(value);
    updateName(value, lastName);
  };

  const handleLastNameChange = (value) => {
    setLastName(value);
    updateName(firstName, value);
  };

  const addPhone = () => {
    setFormData({
      ...formData,
      phones: [...(formData.phones || []), { phone: '', typeId: 1, isPrimary: false }],
    });
  };

  const removePhone = (index) => {
    const newPhones = formData.phones.filter((_, i) => i !== index);
    setFormData({ ...formData, phones: newPhones });
  };

  const updatePhone = (index, field, value) => {
    const newPhones = [...formData.phones];
    if (field === 'isPrimary' && value) {
      // Unset other primary phones
      newPhones.forEach((p, i) => {
        if (i !== index) p.isPrimary = false;
      });
    }
    newPhones[index] = { ...newPhones[index], [field]: value };
    setFormData({ ...formData, phones: newPhones });
  };

  const addEmail = () => {
    setFormData({
      ...formData,
      emails: [...(formData.emails || []), { email: '', typeId: 1, isPrimary: false }],
    });
  };

  const removeEmail = (index) => {
    const newEmails = formData.emails.filter((_, i) => i !== index);
    setFormData({ ...formData, emails: newEmails });
  };

  const updateEmail = (index, field, value) => {
    const newEmails = [...formData.emails];
    if (field === 'isPrimary' && value) {
      // Unset other primary emails
      newEmails.forEach((e, i) => {
        if (i !== index) e.isPrimary = false;
      });
    }
    newEmails[index] = { ...newEmails[index], [field]: value };
    setFormData({ ...formData, emails: newEmails });
  };

  const addWebsite = () => {
    setFormData({
      ...formData,
      websites: [...(formData.websites || []), { url: '', typeId: 1 }],
    });
  };

  const removeWebsite = (index) => {
    const newWebsites = formData.websites.filter((_, i) => i !== index);
    setFormData({ ...formData, websites: newWebsites });
  };

  const updateWebsite = (index, field, value) => {
    const newWebsites = [...formData.websites];
    newWebsites[index] = { ...newWebsites[index], [field]: value };
    setFormData({ ...formData, websites: newWebsites });
  };

  const addAddress = () => {
    setFormData({
      ...formData,
      addresses: [...(formData.addresses || []), {
        street: '',
        street2: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        typeId: 1,
        isPrimary: false,
        mapUrls: [],
      }],
    });
  };

  const addMapUrl = (addressIndex) => {
    const newAddresses = [...formData.addresses];
    if (!newAddresses[addressIndex].mapUrls) {
      newAddresses[addressIndex].mapUrls = [];
    }
    newAddresses[addressIndex].mapUrls.push({ url: '', mapType: 'Google Maps' });
    setFormData({ ...formData, addresses: newAddresses });
  };

  const removeMapUrl = (addressIndex, mapUrlIndex) => {
    const newAddresses = [...formData.addresses];
    newAddresses[addressIndex].mapUrls = newAddresses[addressIndex].mapUrls.filter((_, i) => i !== mapUrlIndex);
    setFormData({ ...formData, addresses: newAddresses });
  };

  const updateMapUrl = (addressIndex, mapUrlIndex, field, value) => {
    const newAddresses = [...formData.addresses];
    newAddresses[addressIndex].mapUrls[mapUrlIndex] = {
      ...newAddresses[addressIndex].mapUrls[mapUrlIndex],
      [field]: value,
    };
    setFormData({ ...formData, addresses: newAddresses });
  };

  const removeAddress = (index) => {
    const newAddresses = formData.addresses.filter((_, i) => i !== index);
    setFormData({ ...formData, addresses: newAddresses });
  };

  const updateAddress = (index, field, value) => {
    const newAddresses = [...formData.addresses];
    if (field === 'isPrimary' && value) {
      // Unset other primary addresses
      newAddresses.forEach((a, i) => {
        if (i !== index) a.isPrimary = false;
      });
    }
    newAddresses[index] = { ...newAddresses[index], [field]: value };
    setFormData({ ...formData, addresses: newAddresses });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => handleFirstNameChange(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => handleLastNameChange(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Type-specific fields */}
      {type === 'patient' && (
        <div className="space-y-2">
          <Label htmlFor="relation">Relation *</Label>
          <Select
            value={formData.relation || 'Self'}
            onValueChange={(value) => setFormData({ ...formData, relation: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PATIENT_RELATIONS.map((relation) => (
                <SelectItem key={relation} value={relation}>
                  {relation}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {type === 'doctor' && (
        <div className="space-y-2">
          <Label>Specialties</Label>
          <div className="flex gap-2 items-center">
            <Select
              value={selectedSpecialty}
              onValueChange={setSelectedSpecialty}
              disabled={specialtiesLoading}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={specialtiesLoading ? "Loading..." : "Select a specialty"} />
              </SelectTrigger>
              <SelectContent>
                {specialties
                  .filter(s => !specialtyArray.includes(s.name))
                  .map((specialty) => (
                    <SelectItem key={specialty.id} value={specialty.name}>
                      {specialty.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (selectedSpecialty && !specialtyArray.includes(selectedSpecialty)) {
                  const newSpecialties = [...specialtyArray, selectedSpecialty];
                  setFormData({ 
                    ...formData, 
                    specialties: newSpecialties,
                    specialty: newSpecialties.join(', ') // Keep for backward compatibility
                  });
                  setSelectedSpecialty('');
                }
              }}
              disabled={!selectedSpecialty}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {specialtyArray.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {specialtyArray.map((specialty, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {specialty}
                  <button
                    type="button"
                    onClick={() => {
                      const newSpecialties = specialtyArray.filter((_, i) => i !== index);
                      setFormData({ 
                        ...formData, 
                        specialties: newSpecialties,
                        specialty: newSpecialties.join(', ') // Keep for backward compatibility
                      });
                    }}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Phones */}
      <div className="space-y-3 border-t pt-4">
        <div className="flex justify-between items-center">
          <Label className="text-base font-semibold">Phone Numbers</Label>
          <Button type="button" variant="outline" size="sm" onClick={addPhone}>
            <Plus className="h-4 w-4 mr-1" />
            Add Phone
          </Button>
        </div>
        {(formData.phones || []).map((phone, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-5 space-y-1">
              <Input
                type="tel"
                placeholder="+1234567890"
                value={phone.phone}
                onChange={(e) => updatePhone(index, 'phone', e.target.value)}
              />
            </div>
            <div className="col-span-3 space-y-1">
              <Select
                value={phone.typeId?.toString() || '1'}
                onValueChange={(value) => updatePhone(index, 'typeId', parseInt(value, 10))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PHONE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value.toString()}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-3 flex items-center gap-2">
              <input
                type="checkbox"
                id={`phone-primary-${index}`}
                checked={phone.isPrimary || false}
                onChange={(e) => updatePhone(index, 'isPrimary', e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor={`phone-primary-${index}`} className="text-sm cursor-pointer">
                Primary
              </Label>
            </div>
            <div className="col-span-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removePhone(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Emails */}
      <div className="space-y-3 border-t pt-4">
        <div className="flex justify-between items-center">
          <Label className="text-base font-semibold">Email Addresses</Label>
          <Button type="button" variant="outline" size="sm" onClick={addEmail}>
            <Plus className="h-4 w-4 mr-1" />
            Add Email
          </Button>
        </div>
        {(formData.emails || []).map((email, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-5 space-y-1">
              <Input
                type="email"
                placeholder="email@example.com"
                value={email.email}
                onChange={(e) => updateEmail(index, 'email', e.target.value)}
              />
            </div>
            <div className="col-span-3 space-y-1">
              <Select
                value={email.typeId?.toString() || '1'}
                onValueChange={(value) => updateEmail(index, 'typeId', parseInt(value, 10))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMAIL_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value.toString()}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-3 flex items-center gap-2">
              <input
                type="checkbox"
                id={`email-primary-${index}`}
                checked={email.isPrimary || false}
                onChange={(e) => updateEmail(index, 'isPrimary', e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor={`email-primary-${index}`} className="text-sm cursor-pointer">
                Primary
              </Label>
            </div>
            <div className="col-span-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeEmail(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Websites */}
      <div className="space-y-3 border-t pt-4">
        <div className="flex justify-between items-center">
          <Label className="text-base font-semibold">Websites</Label>
          <Button type="button" variant="outline" size="sm" onClick={addWebsite}>
            <Plus className="h-4 w-4 mr-1" />
            Add Website
          </Button>
        </div>
        {(formData.websites || []).map((website, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-8 space-y-1">
              <Input
                type="url"
                placeholder="https://example.com"
                value={website.url}
                onChange={(e) => updateWebsite(index, 'url', e.target.value)}
              />
            </div>
            <div className="col-span-3 space-y-1">
              <Select
                value={website.typeId?.toString() || '1'}
                onValueChange={(value) => updateWebsite(index, 'typeId', parseInt(value, 10))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEBSITE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value.toString()}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeWebsite(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Addresses (Patients only) */}
      {type === 'patient' && (
        <div className="space-y-3 border-t pt-4">
          <div className="flex justify-between items-center">
            <Label className="text-base font-semibold">Addresses</Label>
            <Button type="button" variant="outline" size="sm" onClick={addAddress}>
              <Plus className="h-4 w-4 mr-1" />
              Add Address
            </Button>
          </div>
          {(formData.addresses || []).map((address, index) => (
            <div key={index} className="space-y-3 p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <Select
                  value={address.typeId?.toString() || '1'}
                  onValueChange={(value) => updateAddress(index, 'typeId', parseInt(value, 10))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADDRESS_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value.toString()}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`address-primary-${index}`}
                    checked={address.isPrimary || false}
                    onChange={(e) => updateAddress(index, 'isPrimary', e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor={`address-primary-${index}`} className="text-sm cursor-pointer">
                    Primary
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAddress(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Street address"
                  value={address.street || ''}
                  onChange={(e) => updateAddress(index, 'street', e.target.value)}
                />
                <Input
                  placeholder="Apartment, suite, etc. (optional)"
                  value={address.street2 || ''}
                  onChange={(e) => updateAddress(index, 'street2', e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="City"
                    value={address.city || ''}
                    onChange={(e) => updateAddress(index, 'city', e.target.value)}
                  />
                  <Input
                    placeholder="State/Province"
                    value={address.state || ''}
                    onChange={(e) => updateAddress(index, 'state', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Postal/ZIP code"
                    value={address.postalCode || ''}
                    onChange={(e) => updateAddress(index, 'postalCode', e.target.value)}
                  />
                  <Input
                    placeholder="Country"
                    value={address.country || ''}
                    onChange={(e) => updateAddress(index, 'country', e.target.value)}
                  />
                </div>
                
                {/* Map URLs */}
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Map URLs</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addMapUrl(index)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Map URL
                    </Button>
                  </div>
                  {(address.mapUrls || []).map((mapUrl, mapUrlIndex) => (
                    <div key={mapUrlIndex} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-7 space-y-1">
                        <Input
                          type="url"
                          placeholder="https://maps.google.com/..."
                          value={mapUrl.url || ''}
                          onChange={(e) => updateMapUrl(index, mapUrlIndex, 'url', e.target.value)}
                        />
                      </div>
                      <div className="col-span-4 space-y-1">
                        <Select
                          value={mapUrl.mapType || 'Google Maps'}
                          onValueChange={(value) => updateMapUrl(index, mapUrlIndex, 'mapType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MAP_TYPES.map((mapType) => (
                              <SelectItem key={mapType} value={mapType}>
                                {mapType}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMapUrl(index, mapUrlIndex)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </form>
  );
}

