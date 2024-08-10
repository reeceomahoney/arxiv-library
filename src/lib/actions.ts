"use server";

// import prisma from "~/lib/prisma";
// import { revalidatePath } from "next/cache";

// export async function createFolder(formData: FormData) {
//   const name = formData.get("name") as string;
//   const parentId = formData.get("currentId") as string;

//   // TODO: change this
//   const adminUser = await prisma.user.findFirst();

//   if (!adminUser) {
//     throw new Error("Admin user not found");
//   }

//   await prisma.folder.create({
//     data: { name, userId: adminUser.id, parentId },
//   });

//   // TODO: this isnt working
//   revalidatePath("/dashboard");
// }
