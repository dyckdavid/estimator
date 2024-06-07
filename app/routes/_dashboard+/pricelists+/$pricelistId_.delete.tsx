import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { requireUserId } from "#app/utils/auth.server.js";
import { prisma } from "#app/utils/db.server.js";

export async function action({ params, request }: ActionFunctionArgs) {
    // TODO: make sure the user has permission to delete this pricelist
    await requireUserId(request);

    await prisma.pricelist.delete({
        where: {
            id: params.pricelistId,
        },
    });

    return redirect("/pricelists");
}
