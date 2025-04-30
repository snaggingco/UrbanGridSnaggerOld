// This file contains a fixed version of the cashflow tab to use as a reference

// Replace the existing cashflow tab in ReserveFundAnalysis.tsx with this code
const CashflowTabContent = () => {
  return (
    <TabsContent value="cashflow" className="space-y-4">
      {fundingStrategy ? (
        <>
          {/* Comparison card when current contribution is available */}
          {settings.currentContribution && currentContributionPerformance && (
            <Card>
              <CardHeader>
                <CardTitle>Funding Comparison</CardTitle>
                <CardDescription>
                  Comparison between current and recommended funding strategies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="font-medium">Current Funding ({formatCurrency(settings.currentContribution)}/year)</div>
                      <div className="text-sm text-muted-foreground">End balance in {currentYear + settings.studyPeriod}: {formatCurrency(currentContributionPerformance.finalBalance)}</div>
                      <div className="text-sm text-muted-foreground">
                        Minimum balance: {formatCurrency(currentContributionPerformance.minBalance)} in year {currentYear + currentContributionPerformance.minBalanceYear}
                      </div>
                      <Alert variant={currentContributionPerformance.minBalance < 0 ? "destructive" : "default"}>
                        <AlertTitle>Analysis</AlertTitle>
                        <AlertDescription>
                          {currentContributionPerformance.minBalance < 0 
                            ? `Current funding is insufficient. The fund will go negative in year ${currentYear + currentContributionPerformance.minBalanceYear}.` 
                            : "Current funding is sufficient to maintain a positive balance."}
                        </AlertDescription>
                      </Alert>
                    </div>
                    <div className="space-y-2">
                      <div className="font-medium">Recommended Funding ({formatCurrency(fundingStrategy.annualContribution)}/year)</div>
                      <div className="text-sm text-muted-foreground">End balance in {currentYear + settings.studyPeriod}: {formatCurrency(fundingStrategy.cashflow[fundingStrategy.cashflow.length-1].endBalance)}</div>
                      <div className="text-sm text-muted-foreground">
                        Minimum balance: {formatCurrency(summaryStats.minBalance)} in year {currentYear + summaryStats.minBalanceYear}
                      </div>
                      <Alert>
                        <AlertTitle>Analysis</AlertTitle>
                        <AlertDescription>
                          {settings.currentContribution < fundingStrategy.annualContribution
                            ? `Increasing annual contribution by ${formatCurrency(fundingStrategy.annualContribution - settings.currentContribution)} is recommended to maintain adequate reserves.`
                            : `Your current contribution exceeds the minimum recommended amount by ${formatCurrency(settings.currentContribution - fundingStrategy.annualContribution)}.`}
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Cashflow table */}
          <Card>
            <CardHeader>
              <CardTitle>Reserve Fund Cashflow Projection</CardTitle>
              <CardDescription>
                Year-by-year breakdown of the reserve fund performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="recommended">
                <TabsList className="mb-4">
                  <TabsTrigger value="recommended">Recommended Funding</TabsTrigger>
                  {settings.currentContribution && currentContributionPerformance && (
                    <TabsTrigger value="current">Current Funding</TabsTrigger>
                  )}
                </TabsList>
                
                <TabsContent value="recommended">
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Year</TableHead>
                          <TableHead>Begin Balance</TableHead>
                          <TableHead>Contribution</TableHead>
                          <TableHead>Interest Earned</TableHead>
                          <TableHead>Capital Expense</TableHead>
                          <TableHead>End Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fundingStrategy.cashflow.map((entry, index) => (
                          <TableRow key={index} className={entry.endBalance < 0 ? 'bg-red-100 dark:bg-red-900/20' : ''}>
                            <TableCell>{currentYear + entry.year}</TableCell>
                            <TableCell>{formatCurrency(entry.beginBalance)}</TableCell>
                            <TableCell>{formatCurrency(entry.contribution)}</TableCell>
                            <TableCell>{formatCurrency(entry.interest)}</TableCell>
                            <TableCell>
                              {entry.capitalCost > 0 ? (
                                <span className="text-destructive font-medium">-{formatCurrency(entry.capitalCost)}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className={`font-medium ${entry.endBalance < 0 ? 'text-destructive font-bold' : ''}`}>
                              {entry.endBalance < 0 ? 
                                `(${formatCurrency(Math.abs(entry.endBalance))})` : 
                                formatCurrency(entry.endBalance)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </TabsContent>
                
                {settings.currentContribution && currentContributionPerformance && (
                  <TabsContent value="current">
                    <ScrollArea className="h-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Year</TableHead>
                            <TableHead>Begin Balance</TableHead>
                            <TableHead>Contribution</TableHead>
                            <TableHead>Interest Earned</TableHead>
                            <TableHead>Capital Expense</TableHead>
                            <TableHead>End Balance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentContributionPerformance.cashflow.map((entry, index) => (
                            <TableRow key={index} className={entry.endBalance < 0 ? 'bg-red-100 dark:bg-red-900/20' : ''}>
                              <TableCell>{currentYear + entry.year}</TableCell>
                              <TableCell>{formatCurrency(entry.beginBalance)}</TableCell>
                              <TableCell>{formatCurrency(entry.contribution)}</TableCell>
                              <TableCell>{formatCurrency(entry.interest)}</TableCell>
                              <TableCell>
                                {entry.capitalCost > 0 ? (
                                  <span className="text-destructive font-medium">-{formatCurrency(entry.capitalCost)}</span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell className={`font-medium ${entry.endBalance < 0 ? 'text-destructive font-bold' : ''}`}>
                                {entry.endBalance < 0 ? 
                                  `(${formatCurrency(Math.abs(entry.endBalance))})` : 
                                  formatCurrency(entry.endBalance)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </>
      ) : (
        <Alert>
          <Info className="h-4 w-4 mr-2" />
          <AlertTitle>No cashflow data available</AlertTitle>
          <AlertDescription>
            Calculate funding strategies first to view cashflow projections.
          </AlertDescription>
        </Alert>
      )}
    </TabsContent>
  );
};