'use client'

import { useState } from 'react';
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, LayoutDashboard, UserPlus, Laptop, MessageSquareHeart, Settings, Users } from "lucide-react";

type Role = 'doctor' | 'nurse' | 'administrator';

const features = [
  { id: 'dashboard', label: 'Dasbor', icon: LayoutDashboard, roles: ['doctor', 'nurse'] },
  { id: 'register', label: 'Daftarkan Pasien', icon: UserPlus, roles: ['doctor', 'nurse', 'administrator'] },
  { id: 'teleconsultation', label: 'Telekonsultasi', icon: Laptop, roles: ['doctor'] },
  { id: 'testimonials', label: 'Testimoni', icon: MessageSquareHeart, roles: ['doctor', 'nurse', 'administrator'] },
  { id: 'screening', label: 'Skrining Kesehatan', icon: Settings, roles: ['doctor'] },
  { id: 'loginizer', label: 'Hak Akses', icon: Users, roles: ['doctor', 'nurse', 'administrator'] },
];


export default function LoginizerPage() {
    const [selectedRole, setSelectedRole] = useState<Role>('doctor');

    return (
        <div className="animate-in fade-in-50">
            <PageHeader 
                title="Hak Akses Pengguna"
                subtitle="Atur peran dan hak akses untuk setiap pengguna di sistem Anda."
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Pilih Peran Pengguna</CardTitle>
                        <CardDescription>Pilih peran untuk melihat hak akses fiturnya.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup value={selectedRole} onValueChange={(value) => setSelectedRole(value as Role)}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="doctor" id="doctor" />
                                <Label htmlFor="doctor">Dokter</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="nurse" id="nurse" />
                                <Label htmlFor="nurse">Perawat</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="administrator" id="administrator" />
                                <Label htmlFor="administrator">Administrator</Label>
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                     <CardHeader>
                        <CardTitle>Hak Akses Fitur</CardTitle>
                        <CardDescription>
                           Fitur yang dapat diakses oleh peran <span className="font-semibold capitalize text-primary">{selectedRole}</span>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {features.map(feature => {
                                const hasAccess = feature.roles.includes(selectedRole);
                                return (
                                    <div key={feature.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <feature.icon className="h-5 w-5 text-muted-foreground" />
                                            <span>{feature.label}</span>
                                        </div>
                                        {hasAccess ? (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-destructive" />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
