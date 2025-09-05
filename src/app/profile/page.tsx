'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/page-header'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Camera, Mail, Phone, Shield, User, PenSquare } from 'lucide-react'
import Image from 'next/image'


function ProfileCard() {
  return (
    <Card className="lg:col-span-1">
      <CardHeader className="items-center text-center">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src="https://placehold.co/100x100.png" alt="Dr. Amanda" data-ai-hint="person face professional" />
            <AvatarFallback>DA</AvatarFallback>
          </Avatar>
          <Button size="icon" className="absolute bottom-0 right-0 rounded-full h-8 w-8">
            <Camera className="h-4 w-4" />
            <span className="sr-only">Ubah Foto</span>
          </Button>
        </div>
        <CardTitle className="mt-4">Dr. Amanda Sari</CardTitle>
        <CardDescription>Dokter Umum</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm">amanda.sari@faskesq.com</span>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm">+62 812-3456-7890</span>
        </div>
        <Separator />
        <Button className="w-full">Edit Profil</Button>
      </CardContent>
    </Card>
  )
}

function AccountSettings() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Pengaturan Akun</CardTitle>
                <CardDescription>Kelola detail akun dan preferensi Anda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Nama Lengkap</Label>
                        <Input id="fullName" defaultValue="Dr. Amanda Sari" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="specialty">Spesialisasi</Label>
                        <Input id="specialty" defaultValue="Dokter Umum" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="strNumber">Nomor Surat Tanda Registrasi (STR)</Label>
                        <Input id="strNumber" defaultValue="1234567890123456" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sipNumber">Nomor Surat Ijin Praktek (SIP)</Label>
                        <Input id="sipNumber" defaultValue="SIP/123/456/2024" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Alamat Email</Label>
                    <Input id="email" type="email" defaultValue="amanda.sari@faskesq.com" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Nomor Telepon</Label>
                    <Input id="phoneNumber" type="tel" defaultValue="+62 812-3456-7890" />
                </div>
                <Separator />
                <div className="space-y-4">
                    <div className='flex items-center gap-2'>
                        <PenSquare className="h-5 w-5 text-muted-foreground" />
                        <h3 className="text-lg font-medium">Tanda Tangan Digital</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Tanda tangan ini akan digunakan pada dokumen medis seperti surat rujukan.
                    </p>
                    <div className="border rounded-lg p-4 flex flex-col items-center justify-center bg-muted/50 min-h-[120px]">
                        <Image src="https://placehold.co/200x50/png?text=Tanda+Tangan" alt="Tanda Tangan Digital" width={200} height={50} data-ai-hint="signature" />
                    </div>
                    <Button variant="outline">
                        Unggah Tanda Tangan Baru
                    </Button>
                </div>
                 <div className="flex justify-end pt-6">
                    <Button>Simpan Perubahan</Button>
                </div>
            </CardContent>
        </Card>
    )
}

function SecuritySettings() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Keamanan</CardTitle>
                <CardDescription>Kelola pengaturan keamanan Anda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="current-password">Kata Sandi Saat Ini</Label>
                    <Input id="current-password" type="password" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-password">Kata Sandi Baru</Label>
                        <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Konfirmasi Kata Sandi Baru</Label>
                        <Input id="confirm-password" type="password" />
                    </div>
                </div>
                <Separator />
                <div>
                    <h3 className="text-lg font-medium">Autentikasi Dua Faktor (2FA)</h3>
                    <div className="flex items-center justify-between mt-2 p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Aktifkan 2FA untuk lapisan keamanan tambahan.</p>
                        <Switch id="two-factor-auth" />
                    </div>
                </div>
                 <div className="flex justify-end">
                    <Button>Perbarui Kata Sandi</Button>
                </div>
            </CardContent>
        </Card>
    )
}


export default function ProfilePage() {
  return (
    <div className="animate-in fade-in-50">
      <PageHeader title="Profil Pengguna" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ProfileCard />
        <div className="lg:col-span-2">
          <Tabs defaultValue="account">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="account">
                <User className="mr-2 h-4 w-4" />
                Akun
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="mr-2 h-4 w-4" />
                Keamanan
              </TabsTrigger>
            </TabsList>
            <TabsContent value="account">
                <AccountSettings />
            </TabsContent>
            <TabsContent value="security">
                <SecuritySettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
