import { Paper, Text } from '@mantine/core'

import classes from '../../App.module.css'

type StatusItemProps = {
  label: string
  value: string
}

export function StatusItem({ label, value }: StatusItemProps) {
  return (
    <Paper className={classes.statusItem} p="md" radius="md">
      <Text className={classes.statusLabel} size="xs" tt="uppercase">
        {label}
      </Text>
      <Text className={classes.statusValue}>{value}</Text>
    </Paper>
  )
}
