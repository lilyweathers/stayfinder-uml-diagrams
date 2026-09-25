interface NewBooking {
  booking_id?: string;
  property_id: string;
  guest_name: string;
  guest_email: string;
  check_in: string;
  check_out: string;
  guests: number;
  status?: "pending" | "confirmed" | "cancelled";
}

interface Booking extends NewBooking {
  booking_id: string;
  status: "pending" | "confirmed" | "cancelled";
}
