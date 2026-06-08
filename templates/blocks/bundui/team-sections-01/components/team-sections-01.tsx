import Image from "next/image";

const teams = [
  {
    name: "Michael Scott",
    title: "Co-Founder, Chief Architect",
    image:
      "https://plus.unsplash.com/premium_photo-1754211654507-e0a561f6b9c4?q=80&w=721&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    name: "Chandler Rigs",
    title: "Co-Founder, Architect",
    image:
      "https://images.unsplash.com/photo-1754051486494-cfdbf29a589c?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    name: "Isabella Rodriguez",
    title: "Architect",
    image:
      "https://images.unsplash.com/photo-1754006320747-a90ba54b93cd?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    name: "Ava Wilson",
    title: "3D Artist",
    image:
      "https://images.unsplash.com/photo-1753828335589-8fee07cb4cec?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  }
];

export default function TeamSection() {
  return (
    <section className="py-12 lg:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <header className="max-w-2xl space-y-2">
          <h3 className="font-heading text-4xl md:text-5xl">Our team</h3>
          <p className="text-muted-foreground text-balance md:text-lg">
            We craft solutions that amplify key characteristics, achieving a harmonious balance of
            function and intent. Through careful analysis and collaborative engagement, our spaces
            transcend the conventional.
          </p>
        </header>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {teams.map((member, i) => (
            <div key={i} className="bg-card rounded-lg border">
              <div className="relative h-64 w-full overflow-hidden rounded-t-lg">
                <Image
                  src={member.image}
                  alt={`picture of ${member.name}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-t-lg"
                />
              </div>
              <div className="space-y-1 p-4">
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-muted-foreground text-sm">{member.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
