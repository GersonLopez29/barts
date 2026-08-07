import { prisma } from "@/lib/db";
import CategoryManager from "@/components/admin/CategoryManager";
import MenuItemForm from "@/components/admin/MenuItemForm";
import MenuItemsList from "@/components/admin/MenuItemsList";

export default async function AdminMenuPage() {
  const [categories, menuItems] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
    prisma.menuItem.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const categoryOptions = categories.map((cat) => ({ name: cat.name, icon: cat.icon }));
  const categoryRows = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    itemCount: menuItems.filter((item) => item.category === cat.name).length,
  }));

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Categorías</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Crea, renombra o elimina las categorías del menú.
        </p>
        <div className="mt-4">
          <CategoryManager categories={categoryRows} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Agregar producto</h2>
        {categoryOptions.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">
            Primero crea al menos una categoría para poder agregar productos.
          </p>
        ) : (
          <div className="mt-4 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
            <MenuItemForm mode="create" categories={categoryOptions} />
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-zinc-900">
          Productos del menú ({menuItems.length})
        </h2>
        <MenuItemsList
          items={menuItems.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            imageUrl: item.imageUrl,
            available: item.available,
          }))}
          categories={categoryOptions}
        />
      </div>
    </div>
  );
}
