namespace RentalPlatform.Business.Exceptions;

public class BusinessValidationException : Exception
{
    public BusinessValidationException() { }
    
    public BusinessValidationException(string message) : base(message) { }
    
    public BusinessValidationException(string message, Exception innerException) : base(message, innerException) { }
}
