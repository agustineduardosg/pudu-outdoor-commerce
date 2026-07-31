import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Guía de tallas" };

export default function SizeGuidePage() {
  return (
    <InfoPage
      eyebrow="Ajuste y medidas"
      title="Encuentra tu talla."
      lead="La tabla es una referencia conceptual y será reemplazada por medidas verificadas de cada prenda."
      notice="Medir los prototipos finales, confirmar tolerancias y publicar una tabla específica por producto."
      sections={[
        {
          title: "Cómo medir",
          body: (
            <ol>
              <li>Pecho: rodea la parte más amplia, sin apretar la cinta.</li>
              <li>Cintura: mide el contorno natural manteniendo una postura relajada.</li>
              <li>Cadera: mide el punto de mayor volumen con los pies juntos.</li>
              <li>Compara tus medidas con la ficha específica de la prenda.</li>
            </ol>
          ),
        },
        {
          title: "Referencia conceptual",
          body: (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Talla</th><th>Pecho</th><th>Cintura</th><th>Cadera</th></tr>
                </thead>
                <tbody>
                  <tr><td>XS</td><td>84–89 cm</td><td>68–73 cm</td><td>86–91 cm</td></tr>
                  <tr><td>S</td><td>90–95 cm</td><td>74–79 cm</td><td>92–97 cm</td></tr>
                  <tr><td>M</td><td>96–101 cm</td><td>80–85 cm</td><td>98–103 cm</td></tr>
                  <tr><td>L</td><td>102–109 cm</td><td>86–93 cm</td><td>104–111 cm</td></tr>
                  <tr><td>XL</td><td>110–117 cm</td><td>94–101 cm</td><td>112–119 cm</td></tr>
                </tbody>
              </table>
            </div>
          ),
        },
      ]}
    />
  );
}
