export const INFORMACION_SECTIONS = [
  { slug: 'principios', label: 'Principios' },
  { slug: 'objetivos', label: 'Objetivos' },
  { slug: 'mision', label: 'Misión' },
  { slug: 'vision', label: 'Visión' },
  { slug: 'fines', label: 'Fines' },
  { slug: 'autoridades', label: 'Autoridades' },
] as const

export type InformacionSlug = (typeof INFORMACION_SECTIONS)[number]['slug']

export const PRINCIPIOS_CONTENT = `El movimiento estudiantil surge en el Ecuador como un movimiento social autónomo, independiente y democrático para promover la reforma universitaria y la defensa de los derechos estudiantiles y sociales. Somos las y los estudiantes quienes tomamos conciencia, junto a otros sectores, sobre la importancia de la lucha ciudadana por una sociedad justa.

Uno de los principales desafíos es procurar que las Universidades Públicas Ecuatorianas se conviertan en un referente que impulse los postulados del progreso democrático e incluyente, basado en la democratización de los medios de producción, la justicia social y la redistribución equitativa de la riqueza.

Como estudiantes universitarios luchamos para que la universidad ecuatoriana contribuya a la generación de conocimientos, al desarrollo de las fuerzas productivas al servicio de la sociedad y no del capital, y al mejoramiento de las condiciones de vida de las masas populares inspirados en los principios de justicia y equidad.

Las y los estudiantes universitarios del Ecuador, con la responsabilidad y el compromiso con el futuro de la Patria, nos constituimos en una organización que, propendiendo el mejoramiento de las grandes mayorías, sea capaz de hacer del estudiante el motor que impulse los destinos nacionales. Manifestamos nuestro compromiso por fortalecer un movimiento estudiantil con capacidad de potencializar la vitalidad universitaria para engrandecer al pueblo y la Patria.

La FEUE-I hará propia política estudiantil, se preocupará de los grandes problemas nacionales y construirá sus plataformas políticas y de lucha mediante el diálogo y deliberación de los propios estudiantes.

Nuestra organización no depende de injerencia política ni económica de gobierno o partido político alguno. Nuestro accionar como FEUE-I se basará en los siguientes postulados y principios:

Nuestros principios políticos son: la democracia plena, participativa y protagónica; la defensa de la soberanía nacional; la autodeterminación de los pueblos; la integración; la solidaridad internacional; el antimperialismo y anticolonialismo; la defensa del interés general sobre el particular.

Nuestros principios orgánicos son: la crítica y autocrítica; la democracia interna; la participación equitativa; el autogobierno y la dirección colectiva.`

export const FINES_CONTENT = `Expresamos la decisión de los estudiantes universitarios del norte del Ecuador de luchar por el fortalecimiento del Sistema Educativo Superior, por:

a) Procurar que la Universidad se convierta en un postulado de progreso y democracia en la sociedad ecuatoriana.

b) Esforzarse porque la Universidad contribuya en forma científica al desarrollo de las fuerzas productivas, al mejoramiento de las condiciones de vida de las masas populares, inspirada en los principios de justicia y equidad.

c) Contribuir para que la Universidad impulse el vivir democrático del país, impidiendo que progresen en nuestro medio las ideas contrarias a la dignidad humana, y luchar contra todas las influencias del imperialismo, creando un ambiente nacional de auténtica expresión de la voluntad de las mayorías en todo orden de cosas.

d) Luchar por los intereses específicos de los universitarios en el ámbito cultural, económico, político y social, obteniendo de modo preferente la realización de la defensa profesional y procurar la unión de los y las estudiantes universitarios del Ecuador.

e) Enfrentar y resistir en contra del Neoliberalismo como política internacional y defender los recursos naturales e intangibles como del pueblo estado ecuatoriano.

f) Preocuparse y ser solidarios con las luchas de los otros sectores de la sociedad en procura del bien común y la construcción de una sociedad justa.`

export const OBJETIVOS_CONTENT = `Los objetivos de la FEUE-I serán los siguientes:

a) Participar en la discusión de los problemas nacionales e internacionales a todo nivel, proponiendo soluciones científicas, técnicas y humanísticas que vayan a favorecer los intereses del pueblo y la nación.

b) Fortalecer los procesos de reforma universitaria defendiendo la autonomía universitaria responsable, el cogobierno, libertad de cátedra, gratuidad de la enseñanza y demás conquistas estudiantiles.

c) Impulsar una mayor intervención estudiantil en los organismos de dirección universitaria, fomentando la participación estudiantil.

d) Defender los derechos estudiantiles en todos los niveles, la gratuidad, el libre ingreso y el mejoramiento de los servicios de Bienestar Estudiantil.

e) Fomentar la formación integral de nuestros estudiantes, mediante el incremento y el desarrollo de las actividades deportivas, recreativas y culturales.`

export function getSectionLabel(slug: string): string {
  return INFORMACION_SECTIONS.find((s) => s.slug === slug)?.label ?? slug
}
