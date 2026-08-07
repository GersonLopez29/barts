import { prisma } from "@/lib/db";
import { getCategories } from "@/lib/categories";
import MenuItemCard from "@/components/MenuItemCard";

export default async function Home() {
  const [categories, menuItems] = await Promise.all([
    getCategories(),
    prisma.menuItem.findMany({
      orderBy: [{ available: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const itemsByCategory = categories
    .map((category) => ({
      category,
      items: menuItems.filter((item) => item.category === category.name),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-600 to-amber-500">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-red-800/30 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:text-left">
          <p className="inline-block rounded-full bg-white/15 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-amber-100 ring-1 ring-white/20">
            🔥 Hecho al momento
          </p>
          <h1 className="mt-4 max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Hamburguesas, alitas BBQ{" "}
            <span className="text-amber-300">y salchipapas</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm text-red-50 sm:text-base">
            Arma tu pedido y elige delivery o recojo en tienda. Pagas en efectivo,
            Yape o Plin al recibirlo.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <a
              href="#menu"
              className="inline-block rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-red-900 shadow-md transition hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-lg"
            >
              Ver el menú
            </a>
          </div>
        </div>
      </section>

      <div id="menu" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-10">
        {itemsByCategory.length === 0 ? (
          <p className="mt-16 text-center text-sm text-zinc-400">
            Todavía no hay productos publicados en el menú.
          </p>
        ) : (
          <div className="space-y-12">
            {itemsByCategory.map(({ category, items }) => (
              <section key={category.name}>
                <h2 className="flex items-center gap-2 text-xl font-extrabold text-zinc-900">
                  <span aria-hidden="true">{category.icon}</span>
                  {category.name}
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      id={item.id}
                      name={item.name}
                      description={item.description}
                      price={item.price}
                      imageUrl={item.imageUrl}
                      available={item.available}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
