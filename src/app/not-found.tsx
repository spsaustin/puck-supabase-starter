import { Section, Heading, Text, Button } from "@/ds";

export default function NotFound() {
  return (
    <main style={{ flex: 1 }}>
      <Section spacing="loose" width="narrow" align="center">
        <Heading level={1} size="lg">Page not found</Heading>
        <Text muted>Nothing lives at this address.</Text>
        <Button href="/">Back to the home page</Button>
      </Section>
    </main>
  );
}
