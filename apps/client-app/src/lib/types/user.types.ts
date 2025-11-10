import { UserStatusValue } from "../constants/statuses";

// Base User interface
export interface BaseUser {
  id: string;
  uuid: string;
  userType: 'staff' | 'owner' | 'vendor';
  name: string;
  email: string;
  countryCode: string;
  phoneNo: string;
  lastLoginAt: string;
  status: UserStatusValue;
  createdAt: string;
}

export interface Staff extends BaseUser {
  userId: string;
  larksuiteOpenId: string;
  larksuiteUnionId: string;
  avatarUrl: string;
  avatarBig: string;
  type: "super_admin" | "admin" | "staff";
  roles: string[];
}

export interface Owner extends BaseUser {
  userId: string;
  salutation: string;
  ic: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface Vendor extends BaseUser {
  userId: string;
}

export type User = Staff | Owner | Vendor;