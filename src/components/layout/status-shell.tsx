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
  kicker?: string;
  lead?: string;
  title: string;
  variant?: 'compact' | 'hero';
};

export function StatusShell({
  children,
  eyebrow,
  kicker,
  lead,
  title,
  variant = 'hero',
}: StatusShellProps) {
  const isCompact = variant === 'compact';

  return (
    <Box component="main" className={classes.appShell}>
      <Container size="lg">
        <Paper
          className={classes.statusCard}
          data-variant={variant}
          p={isCompact ? { base: 'sm', sm: 'md' } : { base: 'md', sm: 'xl' }}
          radius="lg"
        >
          <Stack gap={isCompact ? 'md' : 'lg'}>
            <Stack
              className={classes.header}
              data-variant={variant}
              gap={isCompact ? 6 : 'md'}
            >
              <Badge
                className={classes.eyebrow}
                variant="light"
                size={isCompact ? 'md' : 'lg'}
              >
                {eyebrow}
              </Badge>
              {kicker ? (
                <Text className={classes.kicker} size="sm">
                  {kicker}
                </Text>
              ) : null}
              <Title className={classes.statusTitle} order={1}>
                {title}
              </Title>
              {lead ? (
                <Text className={classes.lead} size={isCompact ? 'sm' : 'lg'}>
                  {lead}
                </Text>
              ) : null}
            </Stack>
            {children}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
