import {
  Badge,
  Box,
  Container,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import type { ReactNode } from 'react';

import classes from './status-shell.module.css';

type StatusShellProps = {
  children?: ReactNode;
  eyebrow: string;
  lead: string;
  title: string;
};

export function StatusShell({
  children,
  eyebrow,
  lead,
  title,
}: StatusShellProps) {
  return (
    <Box component="main" className={classes.appShell}>
      <Container size="lg">
        <Paper
          className={classes.statusCard}
          p={{ base: 'md', sm: 'xl' }}
          radius="lg"
        >
          <Stack gap="lg">
            <Stack gap="md">
              <Badge className={classes.eyebrow} variant="light" size="lg">
                {eyebrow}
              </Badge>
              <Title className={classes.statusTitle} order={1}>
                {title}
              </Title>
              <Text className={classes.lead} size="lg">
                {lead}
              </Text>
            </Stack>
            {children}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
