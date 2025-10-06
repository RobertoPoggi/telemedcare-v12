-- Insert only test leads first
INSERT INTO leads (
  nomeRichiedente, cognomeRichiedente, emailRichiedente, telefonoRichiedente,
  nomeAssistito, cognomeAssistito, dataNascitaAssistito, cfRichiedente, cfAssistito,
  indirizzoRichiedente, indirizzoAssistito, pacchetto, status, 
  vuoleContratto, note, gdprConsent, consensoPrivacy
) VALUES
  ('Mario', 'Rossi', 'mario.rossi@email.com', '3331234567',
   'Mario', 'Rossi', '1950-03-15', 'RSSMRA50C15H501A', 'RSSMRA50C15H501A',
   'Via Roma 123, 20100 Milano MI', 'Via Roma 123, 20100 Milano MI', 'Base',
   'ACTIVE', 'Si', 'Cliente interessato al servizio base', 'on', 'on'),

  ('Giulia', 'Verdi', 'giulia.verdi@email.com', '3339876543',
   'Anna', 'Verdi', '1965-07-22', 'VRDGLI65L22F205B', 'VRDANN65L62F205B',
   'Via Napoli 456, 00100 Roma RM', 'Via Napoli 456, 00100 Roma RM', 'Avanzato',
   'ACTIVE', 'Si', 'Richiesta per madre anziana', 'on', 'on'),

  ('Franco', 'Bianchi', 'franco.bianchi@email.com', '3335555666',
   'Franco', 'Bianchi', '1958-12-10', 'BNCFNC58T10L219C', 'BNCFNC58T10L219C',
   'Corso Italia 789, 10100 Torino TO', 'Corso Italia 789, 10100 Torino TO', 'Base',
   'NEW', 'Si', 'Lead appena registrato', 'on', 'on'),

  ('Laura', 'Gialli', 'laura.gialli@email.com', '3337777888',
   'Giuseppe', 'Gialli', '1945-05-30', 'GLLLAR70E45H501G', 'GLLGPP45E30H501G',
   'Piazza Duomo 12, 50100 Firenze FI', 'Piazza Duomo 12, 50100 Firenze FI', 'Avanzato',
   'NEW', 'Si', 'Interessata per il padre', 'on', 'on');