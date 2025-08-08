import OFUser from "@/app/models/usermodel";

export async function getAllUsers() {
  return OFUser.find({}).lean();
}

export async function getPublicUsers() {
  // Only safe public fields
  return OFUser.find({}, "username avatarKey bio").lean();
}

export async function getUserById(id: string) {
  return OFUser.findById(id).lean();
}
