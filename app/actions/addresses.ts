"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type UserAddress = {
  id: string;
  label: string;
  recipient_name: string;
  recipient_phone: string;
  full_address: string;
  notes: string | null;
  is_primary: boolean;
};

export type AddressInput = {
  label?: string;
  recipient_name: string;
  recipient_phone: string;
  full_address: string;
  notes?: string;
  is_primary?: boolean;
};

export type AddressActionResult<T = UserAddress> = {
  ok: boolean;
  data?: T;
  error?: string;
};

export async function listAddressesAction(): Promise<AddressActionResult<UserAddress[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Silakan login terlebih dahulu." };
  }

  const { data, error } = await supabase
    .from("user_addresses")
    .select("id, label, recipient_name, recipient_phone, full_address, notes, is_primary")
    .eq("user_id", user.id)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false, error: "Gagal memuat daftar alamat." };
  }

  return { ok: true, data: data ?? [] };
}

export async function createAddressAction(
  input: AddressInput
): Promise<AddressActionResult<UserAddress>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Silakan login terlebih dahulu." };
  }

  const recipientName = input.recipient_name.trim();
  const recipientPhone = input.recipient_phone.trim();
  const fullAddress = input.full_address.trim();
  const label = (input.label ?? "Rumah").trim() || "Rumah";
  const notes = input.notes?.trim() || null;

  if (!recipientName || !recipientPhone || !fullAddress) {
    return {
      ok: false,
      error: "Nama penerima, nomor telepon, dan alamat lengkap wajib diisi.",
    };
  }

  const { count } = await supabase
    .from("user_addresses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const shouldBePrimary = Boolean(input.is_primary) || (count ?? 0) === 0;

  if (shouldBePrimary) {
    await supabase
      .from("user_addresses")
      .update({ is_primary: false })
      .eq("user_id", user.id)
      .eq("is_primary", true);
  }

  const { data, error } = await supabase
    .from("user_addresses")
    .insert({
      user_id: user.id,
      label,
      recipient_name: recipientName,
      recipient_phone: recipientPhone,
      full_address: fullAddress,
      notes,
      is_primary: shouldBePrimary,
    })
    .select("id, label, recipient_name, recipient_phone, full_address, notes, is_primary")
    .single();

  if (error || !data) {
    return { ok: false, error: "Gagal menyimpan alamat pengiriman." };
  }

  revalidatePath("/pesanan");
  return { ok: true, data };
}

export async function updateAddressAction(
  addressId: string,
  input: AddressInput
): Promise<AddressActionResult<UserAddress>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Silakan login terlebih dahulu." };
  }

  const recipientName = input.recipient_name.trim();
  const recipientPhone = input.recipient_phone.trim();
  const fullAddress = input.full_address.trim();
  const label = (input.label ?? "Rumah").trim() || "Rumah";
  const notes = input.notes?.trim() || null;

  if (!recipientName || !recipientPhone || !fullAddress) {
    return {
      ok: false,
      error: "Nama penerima, nomor telepon, dan alamat lengkap wajib diisi.",
    };
  }

  if (input.is_primary) {
    await supabase
      .from("user_addresses")
      .update({ is_primary: false })
      .eq("user_id", user.id)
      .eq("is_primary", true)
      .neq("id", addressId);
  }

  const { data, error } = await supabase
    .from("user_addresses")
    .update({
      label,
      recipient_name: recipientName,
      recipient_phone: recipientPhone,
      full_address: fullAddress,
      notes,
      ...(typeof input.is_primary === "boolean" ? { is_primary: input.is_primary } : {}),
    })
    .eq("id", addressId)
    .eq("user_id", user.id)
    .select("id, label, recipient_name, recipient_phone, full_address, notes, is_primary")
    .single();

  if (error || !data) {
    return { ok: false, error: "Gagal memperbarui alamat." };
  }

  revalidatePath("/pesanan");
  return { ok: true, data };
}

export async function setPrimaryAddressAction(
  addressId: string
): Promise<AddressActionResult<null>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Silakan login terlebih dahulu." };
  }

  await supabase
    .from("user_addresses")
    .update({ is_primary: false })
    .eq("user_id", user.id)
    .eq("is_primary", true);

  const { error } = await supabase
    .from("user_addresses")
    .update({ is_primary: true })
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, error: "Gagal menetapkan alamat utama." };
  }

  revalidatePath("/pesanan");
  return { ok: true, data: null };
}

export async function deleteAddressAction(
  addressId: string
): Promise<AddressActionResult<null>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Silakan login terlebih dahulu." };
  }

  const { data: deleted, error } = await supabase
    .from("user_addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", user.id)
    .select("id, is_primary")
    .maybeSingle();

  if (error || !deleted) {
    return { ok: false, error: "Gagal menghapus alamat." };
  }

  if (deleted.is_primary) {
    const { data: latest } = await supabase
      .from("user_addresses")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latest) {
      await supabase
        .from("user_addresses")
        .update({ is_primary: true })
        .eq("id", latest.id)
        .eq("user_id", user.id);
    }
  }

  revalidatePath("/pesanan");
  return { ok: true, data: null };
}
